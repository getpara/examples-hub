import Capsule, {
  encryptWithDerivedPublicKey,
  generateSignature,
  decryptPrivateKeyAndDecryptShare,
  getAsymmetricKeyPair,
  getDerivedPrivateKeyAndDecrypt,
  encryptPrivateKey,
  getSHA256HashHex,
  decryptPrivateKeyWithPassword,
} from '@usecapsule/web-sdk';
import { ENV } from '../constants';
import { AuthParams, extractAuthInfo, PregenIds, WalletScheme } from '@usecapsule/user-management-client';
import forge from 'node-forge';

export type AuthLoginParams = {
  encryptionKey?: string;
  sessionId?: string;
  newDeviceEncryptionKey?: string;
  newDeviceSessionLookupId?: string;
  skipAutoLogin?: boolean;
  isForKnownDeviceLogin?: boolean;
  partnerId?: string;
  userId?: string;
  pregenIds?: PregenIds;
  displayName?: string;
  pfpUrl?: string;
} & AuthParams;

export type AuthLoginPasswordParams = AuthLoginParams & {
  password: string;
};

export type AuthUpdateKeySharesParams = AuthLoginParams & {
  encryptionKey: string;
  userHandle: string;
  signature?: any;
  passwordId?: string;
};

export async function authLogin(
  capsule: Capsule,
  { partnerId, sessionId, newDeviceSessionLookupId, ...authParams }: AuthLoginParams,
): Promise<{ userId: string; userHandle: string; signature: any; publicKey?: string; passwordId?: string }> {
  const { auth, identifier } = extractAuthInfo(authParams, { allowUserId: true });

  if (!identifier) {
    throw new Error('either a phone number or email address or farcaster username must be provided.');
  }

  const data = await capsule.ctx.capsuleClient.getWebChallenge(auth);

  const signature = await generateSignature(ENV, data.challenge, data.allowedPublicKeys, capsule.ctx.isE2E);
  const { userHandle, ...sigResponse } = signature.response;

  const verifyRes = await capsule.ctx.capsuleClient.verifyWebChallenge(partnerId, {
    signature: sigResponse,
    publicKey: signature.id,
    sessionLookupId: sessionId,
    newDeviceSessionLookupId,
  });

  return { userId: verifyRes.data.userId, userHandle, signature };
}

export async function authLoginWithPassword(
  capsule: Capsule,
  { password, partnerId, sessionId, newDeviceSessionLookupId, ...authParams }: AuthLoginPasswordParams,
) {
  const { auth, identifier } = extractAuthInfo(authParams, { allowUserId: true });

  if (!identifier) {
    throw new Error('either a phone number or email address or farcaster username must be provided.');
  }

  const passwordEntity = (await capsule.ctx.capsuleClient.getPasswords(auth))[0];
  const encryptedWalletPrivateKey = (await capsule.ctx.capsuleClient.getEncryptedWalletPrivateKey(passwordEntity.id)).data
    .encryptedWalletPrivateKey;
  const challenge = (await capsule.ctx.capsuleClient.getWebChallenge(auth)).challenge;

  const { salt } = passwordEntity;
  const saltedPassword = salt + password;
  const userHandle = getSHA256HashHex(saltedPassword);

  const privateKey = await decryptPrivateKeyWithPassword(encryptedWalletPrivateKey.encryptedPrivateKey, userHandle);

  const md = forge.md.sha512.create();
  md.update(challenge, 'utf8');
  const signature = privateKey.sign(md);

  const verifyRes = await capsule.ctx.capsuleClient.verifyPasswordChallenge(partnerId, {
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
  capsule: Capsule,
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
  }: AuthUpdateKeySharesParams,
) {
  const encryptionKeyHash = getSHA256HashHex(userHandle);
  let encryptedShares = [];
  if (passwordId) {
    const encryptedSharesRes = await capsule.ctx.capsuleClient.getPasswordKeyshares(userId, passwordId, true);
    encryptedShares = encryptedSharesRes.data.keyShares;
  } else if (signature) {
    const encryptedSharesRes = await capsule.ctx.capsuleClient.getBiometricKeyshares(userId, signature.id, true);
    encryptedShares = encryptedSharesRes.data.keyShares;
  }
  const { encryptedPrivateKeys } = await capsule.ctx.capsuleClient.getEncryptedWalletPrivateKeys(userId, encryptionKeyHash);
  if (!encryptedShares.length) {
    return;
  }

  if (!partnerId) {
    const touchRes = await capsule.touchSession();
    partnerId = touchRes.data.partnerId;
  }

  // get all shares that are associated with this partnerId
  const sharesForPartnerToDecrypt = encryptedShares
    .filter(share => !capsule.currentWalletIds || capsule.currentWalletIdsUnique.includes(share.walletId))
    .filter(share => {
      return share.walletScheme !== WalletScheme.DKLS || share.partnerId === partnerId;
    });

  // get all walletIds that we'll need a share for
  const allWalletIds = capsule.currentWalletIdsUnique || [
    ...new Set([...sharesForPartnerToDecrypt.map(share => share.walletId)]),
  ];

  // find walletIds that don't have a share for this partner yet
  const walletIdsWithoutPartnerIdShare = allWalletIds.filter(walletId => {
    return !sharesForPartnerToDecrypt.some(share => share.walletId === walletId);
  });
  // if there are some walletIds that are needed for the partner but don't have
  // a share associated with the partner yet, we must refresh and create a share
  // for the partner
  const sharesStillNeededForPartnerToDecrypt = walletIdsWithoutPartnerIdShare
    .map(
      walletId =>
        // just find some share for walletId so we can refresh it, prioritizing first share created
        encryptedShares.find(share => !share.partnerId && share.walletId === walletId) ||
        encryptedShares.find(share => share.walletId === walletId),
    )
    .filter(share => !!share);

  const allSharesToDecrypt = [...sharesForPartnerToDecrypt, ...sharesStillNeededForPartnerToDecrypt];

  // This indicates that the user is using the legacy private key generation method, so we want
  // to update the user to using the new method. There is a chance that this will fail if the
  // passkey was generated with a different platform (flutter, swift, etc.) and if that's the case,
  // then the user will have to login on the original platform to upgrade to the new style of
  // passkey storage which will enable cross platform use.
  let decryptedShares: { walletId: string; walletScheme: string; signer: string; partnerId: string }[];
  if (encryptedPrivateKeys.length === 0) {
    // If this is successful, we can upgrade the user to the new method of passkey schema
    decryptedShares = await getDerivedPrivateKeyAndDecrypt(capsule.ctx, userHandle, allSharesToDecrypt);
    const keyPair = await getAsymmetricKeyPair(capsule.ctx, userHandle);
    const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandle);
    await capsule.ctx.capsuleClient.uploadEncryptedWalletPrivateKey(
      userId,
      encryptedPrivateKeyHex,
      encryptionKeyHash,
      signature.id,
    );
  } else {
    decryptedShares = await decryptPrivateKeyAndDecryptShare(
      userHandle,
      allSharesToDecrypt,
      encryptedPrivateKeys[0].encryptedPrivateKey,
    );
  }

  // refresh needed shares so we have all associated with new partnerId
  const decryptedSharesToRefresh = decryptedShares.filter(
    share => share.walletScheme === WalletScheme.DKLS && share.partnerId !== partnerId,
  );
  const refreshedShares = [] as { walletId: string; signer: string; partnerId: string }[];

  for (const share of decryptedSharesToRefresh) {
    const { signer: refreshedSigner } = await capsule.refreshShare({
      walletId: share.walletId,
      share: share.signer,
      oldPartnerId: share.partnerId,
      newPartnerId: partnerId,
    });
    refreshedShares.push({
      walletId: share.walletId,
      signer: refreshedSigner,
      partnerId: partnerId,
    });
  }

  // find the decrypted shares that are only relevant for the app being logged into
  // (decrypted shares with current partnerId and the newly refreshed shares)
  const decryptedSharesForApp = [
    ...decryptedShares.filter(share => share.walletScheme !== WalletScheme.DKLS || share.partnerId === partnerId),
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
    };
  });

  if (newDeviceSessionLookupId) {
    // need to fetch and decrypt all shares for the new device
    // can't use response above as a refreshed share may have been added here so we must fetch again
    const newEncryptedSharesRes = await capsule.ctx.capsuleClient.getBiometricKeyshares(userId, signature.id, true);
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
      });
    });
  }

  if (tempShareOpts.length > 0) {
    await capsule.ctx.capsuleClient.uploadTransmissionKeyshares(userId, tempShareOpts);
  }

  return userId;
}
