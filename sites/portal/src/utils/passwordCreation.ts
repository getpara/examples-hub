import Para, {
  encryptPrivateKeyWithPassword,
  getAsymmetricKeyPair,
  getPublicKeyHex,
  getSHA256HashHex,
  hashPasswordWithSalt,
} from '@getpara/web-sdk';
import { AuthParams, extractAuthInfo, PasswordStatus } from '@getpara/user-management-client';

export async function passwordCreation(
  para: Para,
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

  const keyPair = await getAsymmetricKeyPair(para.ctx);
  const publicKeyHex = getPublicKeyHex(keyPair);

  const { salt, hash: userHandle } = hashPasswordWithSalt(password);
  const encryptionKeyHash = getSHA256HashHex(userHandle);
  const encryptedPrivateKeyHex = await encryptPrivateKeyWithPassword(keyPair, userHandle);

  await para.ctx.client.patchSessionPassword(partnerId, userId, passwordId, {
    status: PasswordStatus.COMPLETE,
    sigDerivedPublicKey: publicKeyHex,
    salt: salt,
  });

  await para.ctx.client.uploadEncryptedWalletPrivateKey(
    userId,
    encryptedPrivateKeyHex,
    encryptionKeyHash,
    undefined,
    passwordId,
  );
}
