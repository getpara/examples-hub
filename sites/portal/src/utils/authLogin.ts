import { encryptWithDerivedPublicKey, generateSignature, getDerivedPrivateKeyAndDecrypt } from '@usecapsule/web-sdk';
import { ENV } from '../constants';
import capsule from '../clients/capsule';
import { CountryCallingCode } from 'libphonenumber-js';

export async function authLogin(
  partnerId: string,
  email: string,
  phone: string,
  countryCode: CountryCallingCode,
  sessionLookupId: string,
  encryptionKey: string,
  newDeviceSessionLookupId?: string,
  newDeviceEncryptionKey?: string,
): Promise<string> {
  let identifier;
  let data;

  if (email !== 'null' && email !== undefined && email !== '') {
    identifier = email;
    data = await capsule.ctx.capsuleClient.getWebChallenge(encodeURIComponent(email));
  } else if (phone !== 'null' && phone !== undefined && phone !== '') {
    identifier = `${countryCode}${phone}`;
    data = await capsule.ctx.capsuleClient.getWebChallenge(null, encodeURIComponent(phone), encodeURIComponent(countryCode));
  }
  if (!identifier) {
    throw new Error('either a phone number or email address must be provided.');
  }
  const sig = await generateSignature(ENV, data.challenge, data.allowedPublicKeys);
  const userHandle = sig.response.userHandle;
  delete sig.response.userHandle;

  let verifyRes = undefined;
  if (email !== 'null' && email !== undefined && email !== '') {
    verifyRes = await capsule.ctx.capsuleClient.verifyWebChallenge(partnerId, {
      signature: sig.response,
      publicKey: sig.id,
      email: email,
      sessionLookupId,
      newDeviceSessionLookupId,
    });
  } else if (phone !== 'null' && phone !== undefined && phone !== '') {
    verifyRes = await capsule.ctx.capsuleClient.verifyWebChallenge(partnerId, {
      signature: sig.response,
      publicKey: sig.id,
      phone: phone,
      countryCode: countryCode,
      sessionLookupId,
      newDeviceSessionLookupId,
    });
  }
  const userId = verifyRes.data.userId;

  const encryptedSharesRes = await capsule.ctx.capsuleClient.getBiometricKeyshares(userId, sig.id);
  // keyShares undefined or empty array
  if (!encryptedSharesRes.data.keyShares?.length) {
    return;
  }
  const decryptedShares = await getDerivedPrivateKeyAndDecrypt(capsule.ctx, userHandle, encryptedSharesRes.data.keyShares);
  const tempShareOpts = decryptedShares.flatMap((share) => {
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
  await capsule.ctx.capsuleClient.uploadTransmissionKeyshares(userId, tempShareOpts);
  return userId;
}
