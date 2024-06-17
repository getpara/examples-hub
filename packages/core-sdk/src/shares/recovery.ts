import { BackupKitEmailProps, encryptedKeyshare, EncryptorType, KeyType } from '@usecapsule/user-management-client';

import { KeyContainer } from './KeyContainer.js';
import { Ctx } from '../definitions.js';

export async function sendRecoveryForShare(
  ctx: Ctx,
  userId: string,
  walletId: string,
  otherEncryptedShares: encryptedKeyshare[],
  userSigner: string,
  ignoreRedistributingBackupEncryptedShare = false,
  emailProps: BackupKitEmailProps,
): Promise<string> {
  let userBackupKeyShareOptsArr: (encryptedKeyshare & {
    walletId: string;
  })[];
  let recoveryPrivateKeyContainer: KeyContainer | undefined;
  const { recoveryPublicKeys } = await ctx.capsuleClient.getRecoveryPublicKeys(userId);

  if (!recoveryPublicKeys?.length) {
    recoveryPrivateKeyContainer = new KeyContainer(walletId, '', '');
    const { recoveryPublicKeys } = await ctx.capsuleClient.persistRecoveryPublicKeys(userId, [
      recoveryPrivateKeyContainer.getPublicEncryptionKeyHex(),
    ]);

    const encryptedUserBackup = recoveryPrivateKeyContainer.encryptForSelf(userSigner);
    userBackupKeyShareOptsArr = [
      {
        walletId,
        encryptedShare: encryptedUserBackup,
        type: KeyType.USER,
        encryptor: EncryptorType.RECOVERY,
        recoveryPublicKeyId: recoveryPublicKeys[0].id,
      },
    ];
  } else {
    userBackupKeyShareOptsArr = recoveryPublicKeys.map((recoveryPublicKey) => {
      const { id: recoveryPublicKeyId, publicKey } = recoveryPublicKey;
      const encryptedUserBackup = KeyContainer.encryptWithPublicKey(Buffer.from(publicKey, 'hex'), userSigner);
      return {
        walletId,
        encryptedShare: encryptedUserBackup,
        type: KeyType.USER,
        encryptor: EncryptorType.RECOVERY,
        recoveryPublicKeyId,
      };
    });
  }

  await ctx.capsuleClient.uploadUserKeyShares(userId, [
    ...otherEncryptedShares.map((share) => ({
      walletId,
      ...share,
    })),
    ...(ignoreRedistributingBackupEncryptedShare ? [] : userBackupKeyShareOptsArr),
  ]);

  if (!ignoreRedistributingBackupEncryptedShare) {
    await ctx.capsuleClient.distributeCapsuleShare({
      userId,
      walletId,
      useDKLS: ctx.useDKLS,
      ...emailProps,
    });
  }

  return recoveryPrivateKeyContainer ? JSON.stringify(recoveryPrivateKeyContainer) : '';
}
