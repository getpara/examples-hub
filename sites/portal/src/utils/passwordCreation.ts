import Capsule, {
  encryptPrivateKeyWithPassword,
  getAsymmetricKeyPair,
  getPublicKeyHex,
  getSHA256HashHex,
  hashPasswordWithSalt,
} from '@usecapsule/web-sdk';
import { CountryCallingCode } from 'libphonenumber-js';
import { PasswordStatus } from '@usecapsule/user-management-client';

export async function passwordCreation(
  capsule: Capsule,
  partnerId: string,
  userId: string,
  email: string,
  phone: string,
  countryCode: CountryCallingCode,
  farcasterUsername: string,
  password: string,
  passwordId: string,
): Promise<void> {
  let identifier;

  if (email !== 'null' && email !== undefined && email !== '') {
    identifier = email;
  } else if (phone !== 'null' && phone !== undefined && phone !== '') {
    identifier = `${countryCode}${phone}`;
  } else if (farcasterUsername !== 'null' && farcasterUsername !== undefined && farcasterUsername !== '') {
    identifier = `${farcasterUsername}-farcaster`;
  }
  if (!identifier) {
    throw new Error('either a phone number or email address or farcaster username must be provided.');
  }

  const keyPair = await getAsymmetricKeyPair(capsule.ctx);
  const publicKeyHex = getPublicKeyHex(keyPair);

  const { salt, hash: userHandle } = hashPasswordWithSalt(password);
  const encryptionKeyHash = getSHA256HashHex(userHandle);
  const encryptedPrivateKeyHex = await encryptPrivateKeyWithPassword(keyPair, userHandle);

  await capsule.ctx.capsuleClient.patchSessionPassword(partnerId, userId, passwordId, {
    status: PasswordStatus.COMPLETE,
    sigDerivedPublicKey: publicKeyHex,
    salt: salt,
  });

  await capsule.ctx.capsuleClient.uploadEncryptedWalletPrivateKey(
    userId,
    encryptedPrivateKeyHex,
    encryptionKeyHash,
    undefined,
    passwordId,
  );
}
