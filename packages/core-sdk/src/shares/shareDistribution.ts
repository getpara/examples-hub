import { BackupKitEmailProps, EncryptorType, KeyShareType } from '@usecapsule/user-management-client';

import { encryptWithDerivedPublicKey } from '../cryptography/utils.js';
import { sendRecoveryForShare } from './recovery.js';
import { Ctx } from '../definitions.js';

// function to call on new user share to perform all necessary distribution
export async function distributeNewShare(
  ctx: Ctx,
  userId: string,
  walletId: string,
  userShare: string,
  ignoreRedistributingBackupEncryptedShare = false,
  emailProps: BackupKitEmailProps,
  partnerId?: string,
): Promise<string> {
  const publicKeysRes = await ctx.capsuleClient.getSessionPublicKeys(userId);
  const biometricEncryptedShares = publicKeysRes.data.keys
    .map(key => {
      if (!key.publicKey) {
        return;
      }

      const { encryptedMessageHex, encryptedKeyHex } = encryptWithDerivedPublicKey(key.sigDerivedPublicKey, userShare);
      return {
        encryptedShare: encryptedMessageHex,
        encryptedKey: encryptedKeyHex,
        type: KeyShareType.USER,
        encryptor: EncryptorType.BIOMETRICS,
        biometricPublicKey: key.sigDerivedPublicKey,
        partnerId,
      };
    })
    .filter(Boolean);

  const passwords = await ctx.capsuleClient.getPasswords({ userId });
  const passwordEncryptedShares = passwords
    .map(password => {
      if (password.status === 'PENDING') {
        return;
      }

      const { encryptedMessageHex, encryptedKeyHex } = encryptWithDerivedPublicKey(password.sigDerivedPublicKey, userShare);
      return {
        encryptedShare: encryptedMessageHex,
        encryptedKey: encryptedKeyHex,
        type: KeyShareType.USER,
        encryptor: EncryptorType.PASSWORD,
        passwordId: password.id,
        partnerId,
      };
    })
    .filter(Boolean);

  const allEncryptedShares = [...biometricEncryptedShares, ...passwordEncryptedShares];
  return await sendRecoveryForShare(
    ctx,
    userId,
    walletId,
    allEncryptedShares,
    userShare,
    ignoreRedistributingBackupEncryptedShare,
    emailProps,
  );
}
