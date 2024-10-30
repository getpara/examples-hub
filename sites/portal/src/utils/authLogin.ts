import Capsule, {
  encryptWithDerivedPublicKey,
  generateSignature,
  decryptPrivateKeyAndDecryptShare,
  getAsymmetricKeyPair,
  getDerivedPrivateKeyAndDecrypt,
  encryptPrivateKey,
  getSHA256HashHex,
} from '@usecapsule/web-sdk';
import { ENV } from '../constants';
import { CountryCallingCode } from 'libphonenumber-js';
import { WalletScheme } from '@usecapsule/user-management-client';

export async function authLogin(
  capsule: Capsule,
  partnerId: string,
  userId: string,
  email: string,
  phone: string,
  countryCode: CountryCallingCode,
  farcasterUsername: string,
  sessionLookupId: string,
  newDeviceSessionLookupId?: string,
): Promise<{ userId: string; userHandle: string; signature: any }> {
  let identifier;
  let data;

  if (userId !== 'null' && userId !== undefined && userId !== '') {
    identifier = userId;
    data = await capsule.ctx.capsuleClient.getWebChallenge(null, null, null, null, null, userId);
  } else if (email !== 'null' && email !== undefined && email !== '') {
    identifier = email;
    data = await capsule.ctx.capsuleClient.getWebChallenge(encodeURIComponent(email));
  } else if (phone !== 'null' && phone !== undefined && phone !== '') {
    identifier = `${countryCode}${phone}`;
    data = await capsule.ctx.capsuleClient.getWebChallenge(null, encodeURIComponent(phone), encodeURIComponent(countryCode));
  } else if (farcasterUsername !== 'null' && farcasterUsername !== undefined && farcasterUsername !== '') {
    identifier = farcasterUsername;
    data = await capsule.ctx.capsuleClient.getWebChallenge(null, null, null, encodeURIComponent(identifier));
  }
  if (!identifier) {
    throw new Error('either a phone number or email address or farcaster username must be provided.');
  }

  const signature = await generateSignature(ENV, data.challenge, data.allowedPublicKeys, capsule.ctx.isE2E);
  const { userHandle, ...sigResponse } = signature.response;

  let verifyRes = undefined;
  if (email !== 'null' && email !== undefined && email !== '') {
    verifyRes = await capsule.ctx.capsuleClient.verifyWebChallenge(partnerId, {
      signature: sigResponse,
      publicKey: signature.id,
      email: email,
      sessionLookupId,
      newDeviceSessionLookupId,
    });
  } else if (phone !== 'null' && phone !== undefined && phone !== '') {
    verifyRes = await capsule.ctx.capsuleClient.verifyWebChallenge(partnerId, {
      signature: sigResponse,
      publicKey: signature.id,
      phone: phone,
      countryCode: countryCode,
      sessionLookupId,
      newDeviceSessionLookupId,
    });
  } else if (farcasterUsername !== 'null' && farcasterUsername !== undefined && farcasterUsername !== '') {
    verifyRes = await capsule.ctx.capsuleClient.verifyWebChallenge(partnerId, {
      signature: sigResponse,
      publicKey: signature.id,
      farcasterUsername: identifier,
      sessionLookupId,
      newDeviceSessionLookupId,
    });
  }

  return { userId: verifyRes.data.userId, userHandle, signature };
}

export async function authUpdateKeyShares(
  capsule: Capsule,
  sessionLookupId: string,
  userId: string,
  encryptionKey: string,
  userHandle: string,
  signature: any,
  newDeviceSessionLookupId?: string,
  newDeviceEncryptionKey?: string,
  partnerId?: string,
) {
  const encryptionKeyHash = getSHA256HashHex(userHandle);
  const encryptedSharesRes = await capsule.ctx.capsuleClient.getBiometricKeyshares(userId, signature.id, true);
  const { encryptedPrivateKeys } = await capsule.ctx.capsuleClient.getEncryptedWalletPrivateKeys(userId, encryptionKeyHash);
  // keyShares undefined or empty array
  if (!encryptedSharesRes.data.keyShares?.length) {
    return;
  }

  if (!partnerId) {
    const touchRes = await capsule.touchSession();
    partnerId = touchRes.data.partnerId;
  }

  // get all shares that are associated with this partnerId
  const sharesForPartnerToDecrypt = encryptedSharesRes.data.keyShares
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
  const sharesStillNeededForPartnerToDecrypt = walletIdsWithoutPartnerIdShare.map(walletId =>
    // just find some share for walletId so we can refresh it
    encryptedSharesRes.data.keyShares.find(share => share.walletId === walletId),
  );

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
      sessionLookupId,
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
