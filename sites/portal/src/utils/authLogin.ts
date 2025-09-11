import {
  encryptWithDerivedPublicKey,
  generateSignature,
  decryptPrivateKeyAndDecryptShare,
  getAsymmetricKeyPair,
  getDerivedPrivateKeyAndDecrypt,
  encryptPrivateKey,
  getSHA256HashHex,
  decryptPrivateKeyWithPassword,
  Ctx,
} from '@getpara/web-sdk';
import { ParaPortal } from '../classes/ParaPortal';
import { ENV } from '../constants';
import { Auth, PregenIds, PrimaryAuth } from '@getpara/user-management-client';
import forge from 'node-forge';

export type PortalAuthParams = {
  encryptionKey?: string;
  sessionId?: string;
  newDeviceEncryptionKey?: string;
  newDeviceSessionLookupId?: string;
  skipAutoLogin?: boolean;
  isForKnownDeviceLogin?: boolean;
  partnerId?: string;
  pregenIds?: PregenIds;
  isEmbedded?: boolean;
};

export type AuthLoginParams = PortalAuthParams & {
  auth: PrimaryAuth | Auth<'userId'>;
};

export type AuthLoginPasswordParams = AuthLoginParams & {
  password: string;
};

type ShareData = {
  walletId: string;
  walletScheme: string;
  signer: string;
  partnerId?: string;
  protocolId?: string;
};

export type AuthUpdateKeySharesParams = PortalAuthParams & {
  userId: string;
  encryptionKey: string;
  userHandle?: string;
  signature?: any;
  passwordId?: string;
  enclaveShares?: ShareData[];
};

export async function authLogin(
  ctx: Ctx,
  { auth, partnerId, sessionId, newDeviceSessionLookupId }: AuthLoginParams,
): Promise<{ userId: string; userHandle: string; signature: any; publicKey?: string; passwordId?: string }> {
  const data = await ctx.client.getWebChallenge(auth);

  const signature = await generateSignature(ENV, data.challenge, data.allowedPublicKeys, ctx.isE2E);
  const { userHandle, ...sigResponse } = signature.response;

  const verifyRes = await ctx.client.verifyWebChallenge(partnerId, {
    signature: sigResponse,
    publicKey: signature.id,
    sessionLookupId: sessionId,
    newDeviceSessionLookupId,
  });

  return { userId: verifyRes.data.userId, userHandle, signature };
}

export async function authLoginWithPassword(
  ctx: Ctx,
  { auth, password, partnerId, sessionId, newDeviceSessionLookupId }: AuthLoginPasswordParams,
  isPIN?: boolean,
) {
  const allPasswords = await ctx.client.getPasswords(auth);
  const passwordEntity = isPIN ? allPasswords.find(p => p.isPIN) : allPasswords.find(p => !p.isPIN);

  if (!passwordEntity) {
    throw new Error(`No ${isPIN ? 'PIN' : 'password'} found for user`);
  }

  const encryptedWalletPrivateKey = (await ctx.client.getEncryptedWalletPrivateKey(passwordEntity.id, sessionId)).data
    .encryptedWalletPrivateKey;
  const challenge = (await ctx.client.getWebChallenge(auth)).challenge;

  const { salt } = passwordEntity;
  const saltedPassword = salt + password;
  const userHandle = getSHA256HashHex(saltedPassword);

  const privateKey = await decryptPrivateKeyWithPassword(encryptedWalletPrivateKey.encryptedPrivateKey, userHandle);

  const md = forge.md.sha512.create();
  md.update(challenge, 'utf8');
  const signature = privateKey.sign(md);

  const verifyRes = await ctx.client.verifyPasswordChallenge(partnerId, {
    signature,
    publicKey: passwordEntity.sigDerivedPublicKey,
    sessionLookupId: sessionId,
    newDeviceSessionLookupId,
  });

  return {
    userId: verifyRes.data.userId,
    userHandle,
    signature,
    publicKey: passwordEntity.sigDerivedPublicKey,
    passwordId: passwordEntity.id,
  };
}

export async function authUpdateKeyShares(
  para: ParaPortal,
  {
    sessionId,
    userId,
    encryptionKey,
    userHandle,
    signature,
    newDeviceSessionLookupId,
    newDeviceEncryptionKey,
    partnerId,
    passwordId,
    enclaveShares,
  }: AuthUpdateKeySharesParams,
) {
  let decryptedShares: { walletId: string; walletScheme: string; signer: string; partnerId?: string; protocolId?: string }[];
  const hasWalletSelection = para.currentWalletIds && Object.keys(para.currentWalletIds).length > 0;
  let walletIdsWithoutPartnerIdShare: string[] = [];
  let encryptedPrivateKeys: { encryptedPrivateKey: string }[] = [];

  if (para.isEnclaveUser) {
    const allWalletIds = para.currentWalletIdsUnique || [...new Set([...enclaveShares.map(share => share.walletId)])];

    const decryptedSharesForPartner = enclaveShares
      .filter(share => !hasWalletSelection || para.currentWalletIdsUnique.includes(share.walletId))
      .filter(share => share.walletScheme !== 'DKLS' || share.partnerId === partnerId);
    // find walletIds that don't have a share for this partner yet
    walletIdsWithoutPartnerIdShare = allWalletIds.filter(walletId => {
      return !decryptedSharesForPartner.some(share => share.walletId === walletId);
    });

    const decryptedSharesStillNeededForPartner = walletIdsWithoutPartnerIdShare.map(walletId => {
      return enclaveShares.find(share => share.walletId === walletId);
    });

    decryptedShares = [...decryptedSharesForPartner, ...decryptedSharesStillNeededForPartner];
  } else {
    const encryptionKeyHash = getSHA256HashHex(userHandle);
    let encryptedShares = [];
    if (passwordId) {
      const encryptedSharesRes = await para.ctx.client.getPasswordKeyshares(userId, passwordId, true);
      encryptedShares = encryptedSharesRes.data.keyShares;
    } else if (signature) {
      const encryptedSharesRes = await para.ctx.client.getBiometricKeyshares(userId, signature.id, true);
      encryptedShares = encryptedSharesRes.data.keyShares;
    }
    encryptedPrivateKeys = (await para.ctx.client.getEncryptedWalletPrivateKeys(userId, encryptionKeyHash))
      .encryptedPrivateKeys;
    if (!encryptedShares.length) {
      return;
    }

    if (!partnerId) {
      const session = await para.touchSession();
      partnerId = session.partnerId;
    }

    const walletIdToPartnerShareCount = {} as Record<string, Record<string, number>>;
    let tooManyKeySharesForSomePartner = false;
    for (const share of encryptedShares) {
      if (!walletIdToPartnerShareCount[share.walletId]) {
        walletIdToPartnerShareCount[share.walletId] = {};
      }
      if (!walletIdToPartnerShareCount[share.walletId][share.partnerId]) {
        walletIdToPartnerShareCount[share.walletId][share.partnerId] = 0;
      }

      walletIdToPartnerShareCount[share.walletId][share.partnerId]++;
      if (walletIdToPartnerShareCount[share.walletId][share.partnerId] > 1) {
        tooManyKeySharesForSomePartner = true;
        break;
      }
    }

    // get all shares that are associated with this partnerId

    const potentialSharesForPartnerToDecrypt = encryptedShares
      .filter(share => !hasWalletSelection || para.currentWalletIdsUnique.includes(share.walletId))
      .filter(share => {
        return share.walletScheme !== 'DKLS' || share.partnerId === partnerId;
      });

    const sharesForPartnerToDecrypt = [];
    // pick out shares for partner if there is only one share for the walletId
    // or if there are more, ensure it has a protocolId, otherwise we will refresh to ensure the refreshed share
    // has a protocolId
    potentialSharesForPartnerToDecrypt.forEach(share => {
      if (share.walletScheme === 'DKLS' && share.partnerId === partnerId && tooManyKeySharesForSomePartner) {
        if (sharesForPartnerToDecrypt.some(s => s.walletId === share.walletId)) {
          return;
        }
        if (share.protocolId) {
          sharesForPartnerToDecrypt.push(share);
        }
      } else {
        sharesForPartnerToDecrypt.push(share);
      }
    });

    // get all walletIds that we'll need a share for
    const allWalletIds = para.currentWalletIdsUnique || [
      ...new Set([...sharesForPartnerToDecrypt.map(share => share.walletId)]),
    ];

    // find walletIds that don't have a share for this partner yet
    walletIdsWithoutPartnerIdShare = allWalletIds.filter(walletId => {
      return !sharesForPartnerToDecrypt.some(share => share.walletId === walletId);
    });
    // if there are some walletIds that are needed for the partner but don't have
    // a share associated with the partner yet, we must refresh and create a share
    // for the partner
    const sharesStillNeededForPartnerToDecrypt = walletIdsWithoutPartnerIdShare
      .map(
        walletId =>
          // find the oldest share for walletId so we can refresh it
          encryptedShares
            .filter(share => share.walletId === walletId)
            .sort((s1, s2) => new Date(s1.createdAt).valueOf() - new Date(s2.createdAt).valueOf())[0],
      )
      .filter(share => !!share);

    const allSharesToDecrypt = [...sharesForPartnerToDecrypt, ...sharesStillNeededForPartnerToDecrypt];

    // This indicates that the user is using the legacy private key generation method, so we want
    // to update the user to using the new method. There is a chance that this will fail if the
    // passkey was generated with a different platform (flutter, swift, etc.) and if that's the case,
    // then the user will have to login on the original platform to upgrade to the new style of
    // passkey storage which will enable cross platform use.
    if (encryptedPrivateKeys.length === 0) {
      // If this is successful, we can upgrade the user to the new method of passkey schema
      decryptedShares = await getDerivedPrivateKeyAndDecrypt(para.ctx, userHandle, allSharesToDecrypt);
      const keyPair = await getAsymmetricKeyPair(para.ctx, userHandle);
      const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandle);
      const { encryptedWalletPrivateKey: createdEncryptedPrivateKey } =
        await para.ctx.client.uploadEncryptedWalletPrivateKey(
          userId,
          encryptedPrivateKeyHex,
          encryptionKeyHash,
          signature?.id,
          passwordId,
        );
      // add the created encrypted private key to the list of encrypted private keys in case we need to use it
      // later in this function
      encryptedPrivateKeys.push(createdEncryptedPrivateKey);
    } else {
      decryptedShares = await decryptPrivateKeyAndDecryptShare(
        userHandle,
        allSharesToDecrypt,
        encryptedPrivateKeys[0].encryptedPrivateKey,
      );
    }
  }

  // refresh needed shares so we have all associated with new partnerId
  const decryptedSharesToRefresh = decryptedShares.filter(share => walletIdsWithoutPartnerIdShare.includes(share.walletId));
  const refreshedShares = [] as { walletId: string; signer: string; partnerId: string; protocolId: string }[];

  for (const share of decryptedSharesToRefresh) {
    const { signer: refreshedSigner, protocolId } = await para.refreshShare({
      walletId: share.walletId,
      share: share.signer,
      oldPartnerId: share.partnerId,
      newPartnerId: partnerId,
      keyShareProtocolId: share.protocolId,
    });
    refreshedShares.push({
      walletId: share.walletId,
      signer: refreshedSigner,
      partnerId: partnerId,
      protocolId,
    });
  }

  // find the decrypted shares that are only relevant for the app being logged into
  // (decrypted shares with current partnerId and the newly refreshed shares)
  const decryptedSharesForApp = [
    ...decryptedShares.filter(share => share.walletScheme !== 'DKLS' || share.partnerId === partnerId),
    ...refreshedShares,
  ];

  // This gets only the decryptedShares that are associated with the
  // currently selected walletIds
  const tempShareOpts = decryptedSharesForApp.map(share => {
    const { encryptedMessageHex, encryptedKeyHex } = encryptWithDerivedPublicKey(encryptionKey, share.signer);
    return {
      walletId: share.walletId,
      encryptedShare: encryptedMessageHex,
      encryptedKey: encryptedKeyHex,
      sessionLookupId: sessionId,
      partnerId: share.partnerId,
      protocolId: share.protocolId,
    };
  });

  if (newDeviceSessionLookupId) {
    // need to fetch and decrypt all shares for the new device
    // can't use response above as a refreshed share may have been added here so we must fetch again
    const newEncryptedSharesRes = await para.ctx.client.getBiometricKeyshares(userId, signature.id, true);
    const allDecryptedShares = await decryptPrivateKeyAndDecryptShare(
      userHandle,
      newEncryptedSharesRes.data.keyShares,
      encryptedPrivateKeys[0].encryptedPrivateKey,
    );
    allDecryptedShares.forEach(share => {
      const { encryptedMessageHex: newMessageHex, encryptedKeyHex: newKeyHex } = encryptWithDerivedPublicKey(
        newDeviceEncryptionKey,
        share.signer,
      );
      tempShareOpts.push({
        walletId: share.walletId,
        encryptedShare: newMessageHex,
        encryptedKey: newKeyHex,
        sessionLookupId: `${newDeviceSessionLookupId}-new-device`,
        partnerId: share.partnerId,
        protocolId: share.protocolId,
      });
    });
  }

  if (tempShareOpts.length > 0) {
    await para.ctx.client.uploadTransmissionKeyshares(userId, tempShareOpts);
  }

  return userId;
}
