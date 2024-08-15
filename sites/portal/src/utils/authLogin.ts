import Capsule, {
  encryptWithDerivedPublicKey,
  generateSignature,
  decryptPrivateKeyAndDecryptShare,
  getAsymmetricKeyPair,
  getDerivedPrivateKeyAndDecrypt,
  encryptPrivateKey,
} from '@usecapsule/web-sdk';
import { ENV } from '../constants';
import { getSHA256HashHex } from '@usecapsule/web-sdk';
import { CountryCallingCode } from 'libphonenumber-js';

export async function authLogin(
  capsule: Capsule,
  partnerId: string,
  email: string,
  phone: string,
  countryCode: CountryCallingCode,
  farcasterUsername: string,
  sessionLookupId: string,
  newDeviceSessionLookupId?: string,
): Promise<[string, string, any]> {
  let identifier;
  let data;

  if (email !== 'null' && email !== undefined && email !== '') {
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

  const signature = await generateSignature(ENV, data.challenge, data.allowedPublicKeys);
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

  return [verifyRes.data.userId, userHandle, signature];
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
) {
  const encryptionKeyHash = getSHA256HashHex(userHandle);
  const encryptedSharesRes = await capsule.ctx.capsuleClient.getBiometricKeyshares(userId, signature.id);
  const { encryptedPrivateKeys } = await capsule.ctx.capsuleClient.getEncryptedWalletPrivateKeys(userId, encryptionKeyHash);
  // keyShares undefined or empty array
  if (!encryptedSharesRes.data.keyShares?.length) {
    return;
  }

  // This indicates that the user is using the legacy private key generation method, so we want
  // to update the user to using the new method. There is a chance that this will fail if the
  // passkey was generated with a different platform (flutter, swift, etc.) and if that's the case,
  // then the user will have to login on the original platform to upgrade to the new style of
  // passkey storage which will enable cross platform use.
  let decryptedShares: any[];
  if (encryptedPrivateKeys.length === 0) {
    // If this is successful, we can upgrade the user to the new method of passkey schema
    decryptedShares = await getDerivedPrivateKeyAndDecrypt(capsule.ctx, userHandle, encryptedSharesRes.data.keyShares);
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
      encryptedSharesRes.data.keyShares,
      encryptedPrivateKeys[0].encryptedPrivateKey,
    );
  }

  // This gets only the decryptedShares that are associated with the
  // currently selected walletIds
  const tempShareOpts = decryptedShares
    .filter(share => !capsule.currentWalletIds || capsule.currentWalletIds.includes(share.walletId))
    .flatMap(share => {
      const { encryptedMessageHex, encryptedKeyHex } = encryptWithDerivedPublicKey(encryptionKey, share.signer);
      const opts = [
        {
          walletId: share.walletId,
          encryptedShare: encryptedMessageHex,
          encryptedKey: encryptedKeyHex,
          sessionLookupId,
        },
      ];

      if (newDeviceSessionLookupId) {
        const { encryptedMessageHex: newMessageHex, encryptedKeyHex: newKeyHex } = encryptWithDerivedPublicKey(
          newDeviceEncryptionKey,
          share.signer,
        );
        opts.push({
          walletId: share.walletId,
          encryptedShare: newMessageHex,
          encryptedKey: newKeyHex,
          sessionLookupId: `${newDeviceSessionLookupId}-new-device`,
        });
      }

      return opts;
    });

  if (tempShareOpts.length > 0) {
    await capsule.ctx.capsuleClient.uploadTransmissionKeyshares(userId, tempShareOpts);
  }

  return userId;
}
