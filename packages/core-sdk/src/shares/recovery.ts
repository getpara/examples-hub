import { BackupKitEmailProps, EncryptedKeyShare, EncryptorType, KeyShareType } from '@getpara/user-management-client';

import { KeyContainer } from './KeyContainer.js';
import { Ctx } from '../definitions.js';

export async function sendRecoveryForShare({
  ctx,
  userId,
  walletId,
  otherEncryptedShares = [],
  userSigner,
  ignoreRedistributingBackupEncryptedShare = false,
  emailProps = {},
  forceRefresh = false,
}: {
  ctx: Ctx;
  userId: string;
  walletId: string;
  otherEncryptedShares?: EncryptedKeyShare[];
  userSigner: string;
  ignoreRedistributingBackupEncryptedShare?: boolean;
  emailProps?: BackupKitEmailProps;
  forceRefresh?: boolean;
}): Promise<string> {
  if (ignoreRedistributingBackupEncryptedShare) {
    await ctx.client.uploadUserKeyShares(
      userId,
      otherEncryptedShares.map(share => ({
        walletId,
        ...share,
      })),
    );
    return '';
  }

  let userBackupKeyShareOptsArr: (EncryptedKeyShare & {
    walletId: string;
  })[];
  let recoveryPrivateKeyContainer: KeyContainer | undefined;
  const { recoveryPublicKeys } = await ctx.client.getRecoveryPublicKeys(userId);

  if (forceRefresh || !recoveryPublicKeys?.length) {
    recoveryPrivateKeyContainer = new KeyContainer(walletId, '', '');
    const { recoveryPublicKeys } = await ctx.client.persistRecoveryPublicKeys(userId, [
      recoveryPrivateKeyContainer.getPublicEncryptionKeyHex(),
    ]);

    const encryptedUserBackup = recoveryPrivateKeyContainer.encryptForSelf(userSigner);
    userBackupKeyShareOptsArr = [
      {
        walletId,
        encryptedShare: encryptedUserBackup,
        type: KeyShareType.USER,
        encryptor: EncryptorType.RECOVERY,
        recoveryPublicKeyId: recoveryPublicKeys[0].id,
      },
    ];
  } else {
    userBackupKeyShareOptsArr = recoveryPublicKeys.map(recoveryPublicKey => {
      const { id: recoveryPublicKeyId, publicKey } = recoveryPublicKey;
      const encryptedUserBackup = KeyContainer.encryptWithPublicKey(Buffer.from(publicKey, 'hex'), userSigner);
      return {
        walletId,
        encryptedShare: encryptedUserBackup,
        type: KeyShareType.USER,
        encryptor: EncryptorType.RECOVERY,
        recoveryPublicKeyId,
      };
    });
  }

  await ctx.client.uploadUserKeyShares(userId, [
    ...otherEncryptedShares.map(share => ({
      walletId,
      ...share,
    })),
    ...(ignoreRedistributingBackupEncryptedShare ? [] : userBackupKeyShareOptsArr),
  ]);

  await ctx.client.distributeParaShare({
    userId,
    walletId,
    useDKLS: ctx.useDKLS,
    ...emailProps,
  });

  return recoveryPrivateKeyContainer ? JSON.stringify(recoveryPrivateKeyContainer) : '';
}
