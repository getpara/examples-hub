import Para, {
  encryptPrivateKeyWithPassword,
  getAsymmetricKeyPair,
  getPublicKeyHex,
  getSHA256HashHex,
  hashPasswordWithSalt,
} from '@getpara/web-sdk';
import { PasswordStatus } from '@getpara/user-management-client';

export async function passwordCreation(
  para: Para,
  {
    userId,
    partnerId,
    password,
    passwordId,
  }: {
    partnerId: string;
    userId: string;
    password: string;
    passwordId: string;
  },
): Promise<void> {
  const keyPair = await getAsymmetricKeyPair(para.ctx);
  const publicKeyHex = getPublicKeyHex(keyPair);

  const { salt, hash: userHandle } = hashPasswordWithSalt(password);
  const encryptionKeyHash = getSHA256HashHex(userHandle);
  const encryptedPrivateKeyHex = await encryptPrivateKeyWithPassword(keyPair, userHandle);

  await para.ctx.client.patchSessionPassword(partnerId, userId, passwordId, {
    status: PasswordStatus.COMPLETE,
    sigDerivedPublicKey: publicKeyHex,
    salt: salt,
    encryptedWalletPrivateKey: encryptedPrivateKeyHex,
    encryptionKeyHash: encryptionKeyHash,
  });
}
