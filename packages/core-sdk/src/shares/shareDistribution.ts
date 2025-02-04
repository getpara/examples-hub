import { BackupKitEmailProps, EncryptorType, KeyShareType } from '@getpara/user-management-client';

import { encryptWithDerivedPublicKey } from '../cryptography/utils.js';
import { sendRecoveryForShare } from './recovery.js';
import { Ctx } from '../definitions.js';

// function to call on new user share to perform all necessary distribution
export async function distributeNewShare({
  ctx,
  userId,
  walletId,
  userShare,
  ignoreRedistributingBackupEncryptedShare = false,
  emailProps = {},
  partnerId,
  protocolId,
}: {
  ctx: Ctx;
  userId: string;
  walletId: string;
  userShare: string;
  ignoreRedistributingBackupEncryptedShare?: boolean;
  emailProps?: BackupKitEmailProps;
  partnerId?: string;
  protocolId?: string;
}): Promise<string> {
  const publicKeysRes = await ctx.client.getSessionPublicKeys(userId);
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
        protocolId,
      };
    })
    .filter(Boolean);

  const passwords = await ctx.client.getPasswords({ userId });
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
        protocolId,
      };
    })
    .filter(Boolean);

  const allEncryptedShares = [...biometricEncryptedShares, ...passwordEncryptedShares];
  return await sendRecoveryForShare({
    ctx,
    userId,
    walletId,
    otherEncryptedShares: allEncryptedShares,
    userSigner: userShare,
    ignoreRedistributingBackupEncryptedShare,
    emailProps,
  });
}
