import {
  encryptWithDerivedPublicKey,
  generateSignature,
  getDerivedPrivateKeyAndDecrypt,
} from '@usecapsule/web-sdk';
import { ENV } from '../constants';
import capsule from '../clients/capsule';

export async function authLogin(
  email: string,
  sessionLookupId: string,
  encryptionKey: string,
  newDeviceSessionLookupId?: string,
  newDeviceEncryptionKey?: string,
): Promise<string> {
  const data = await capsule.ctx.capsuleClient.getWebChallenge(
    encodeURIComponent(email),
  );
  const sig = await generateSignature(
    ENV,
    data.challenge,
    data.allowedPublicKeys,
  );
  const userHandle = sig.response.userHandle;
  delete sig.response.userHandle;

  const verifyRes = await capsule.ctx.capsuleClient.verifyWebChallenge({
    signature: sig.response,
    publicKey: sig.id,
    email,
    sessionLookupId,
    newDeviceSessionLookupId,
  });
  const userId = verifyRes.data.userId;

  const encryptedSharesRes =
    await capsule.ctx.capsuleClient.getBiometricKeyshares(userId, sig.id);
  // keyShares undefined or empty array
  if (!encryptedSharesRes.data.keyShares?.length) {
    return;
  }
  const decryptedShares = await getDerivedPrivateKeyAndDecrypt(
    capsule.ctx,
    userHandle,
    encryptedSharesRes.data.keyShares,
  );
  const tempShareOpts = decryptedShares.flatMap((share) => {
    const { encryptedMessageHex, encryptedKeyHex } =
      encryptWithDerivedPublicKey(encryptionKey, share.signer);
    const opts = [
      {
        walletId: share.walletId,
        encryptedShare: encryptedMessageHex,
        encryptedKey: encryptedKeyHex,
        sessionLookupId,
      },
    ];

    if (newDeviceSessionLookupId) {
      const { encryptedMessageHex: newMessageHex, encryptedKeyHex: newKeyHex } =
        encryptWithDerivedPublicKey(newDeviceEncryptionKey, share.signer);
      opts.push({
        walletId: share.walletId,
        encryptedShare: newMessageHex,
        encryptedKey: newKeyHex,
        sessionLookupId: `${newDeviceSessionLookupId}-new-device`,
      });
    }

    return opts;
  });
  await capsule.ctx.capsuleClient.uploadTransmissionKeyshares(
    userId,
    tempShareOpts,
  );
  return userId;
}
