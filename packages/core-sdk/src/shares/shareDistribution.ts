import { BackupKitEmailProps, EncryptorType, KeyType } from '@usecapsule/user-management-client';

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
        type: KeyType.USER,
        encryptor: EncryptorType.BIOMETRICS,
        biometricPublicKey: key.sigDerivedPublicKey,
        partnerId,
      };
    })
    .filter(Boolean);
  return await sendRecoveryForShare(
    ctx,
    userId,
    walletId,
    biometricEncryptedShares,
    userShare,
    ignoreRedistributingBackupEncryptedShare,
    emailProps,
  );
}
