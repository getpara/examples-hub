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
  const capsuleShare = await ctx.capsuleClient.getCapsuleShare(
    userId,
    walletId,
  );
  const recoveryPrivateKeyContainer = new KeyContainer(
    walletId,
    capsuleShare.data.signer.signer,
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
  console.log('recovery:');
  console.log(JSON.stringify(recoveryPrivateKeyContainer));
  return JSON.stringify(recoveryPrivateKeyContainer);
  // TODO: add functionality to email recovery or distribute it somehow
  // distribute recovery right here
}
