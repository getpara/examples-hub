import {
  encryptedKeyshare,
  EncryptorType,
  KeyType,
} from '@usecapsule/user-management-client';

import { KeyContainer } from './KeyContainer';
import { Ctx } from '../definitions';

export async function sendRecoveryForShare(
  ctx: Ctx,
  userId: string,
  walletId: string,
  otherEncryptedShares: encryptedKeyshare[],
  userSigner: string,
  ignoreRedistributingBackupEncryptedShare = false,
): Promise<string> {
  const recoveryPrivateKeyContainer = new KeyContainer(
    walletId,
    '',
    '', // TODO: add in if needed
  );
  const encryptedUserBackup =
    recoveryPrivateKeyContainer.encryptForSelf(userSigner);
  const userBackupKeyShareOpts = {
    encryptedShare: encryptedUserBackup,
    type: KeyType.USER,
    encryptor: EncryptorType.RECOVERY,
  };
  await ctx.capsuleClient.uploadKeyshares(userId, walletId, [
    ...otherEncryptedShares,
    ...(ignoreRedistributingBackupEncryptedShare
      ? []
      : [userBackupKeyShareOpts]),
  ]);

  if (!ignoreRedistributingBackupEncryptedShare) {
    await ctx.capsuleClient.distributeCapsuleShare(userId, walletId, ctx.useDKLS);
  }

  return JSON.stringify(recoveryPrivateKeyContainer);
}
