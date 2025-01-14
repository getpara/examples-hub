import Capsule, {
  encryptPrivateKeyWithPassword,
  getAsymmetricKeyPair,
  getPublicKeyHex,
  getSHA256HashHex,
  hashPasswordWithSalt,
} from '@usecapsule/web-sdk';
import { AuthParams, extractAuthInfo, PasswordStatus } from '@usecapsule/user-management-client';

export async function passwordCreation(
  capsule: Capsule,
  {
    auth,
    userId,
    partnerId,
    password,
    passwordId,
  }: {
    partnerId: string;
    userId: string;
    auth: AuthParams;
    password: string;
    passwordId: string;
  },
): Promise<void> {
  const { publicKeyIdentifier } = extractAuthInfo(auth);

  if (!publicKeyIdentifier) {
    throw new Error('a phone number, email address, Farcaster username, or Telegram user ID must be provided');
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
