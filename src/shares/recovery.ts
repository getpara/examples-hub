import { encryptedKeyshare, EncryptorType, KeyType } from '@capsule/client';

import { KeyContainer } from './KeyContainer';
import { userManagementClient } from '../external/userManagementClient';

export async function recoverUserShare(
  userId: string,
  walletId: string,
  email: string,
  serializedRecoveryShare: string
): Promise<string> {
  // TODO: allow passing in verification code here
  await userManagementClient.recoveryVerification(email, '123456');
  const res = await userManagementClient.getKeyshare(
    userId,
    walletId,
    KeyType.USER,
    EncryptorType.RECOVERY
  );

  const recoveryPrivateKeyContainer = KeyContainer.import(
    serializedRecoveryShare
  );
  return recoveryPrivateKeyContainer.decrypt(res.data.keyShare.encryptedShare);
}

export async function sendRecoveryForShare(
  userId: string,
  walletId: string,
  otherEncryptedShares: encryptedKeyshare[],
  userSigner: string
): Promise<void> {
  const capsuleShare = await userManagementClient.getCapsuleShare(
    userId,
    walletId
  );
  const recoveryPrivateKeyContainer = new KeyContainer(
    walletId,
    capsuleShare.data.signer.signer,
    '' // TODO: add in if needed
  );
  const encryptedUserBackup =
    recoveryPrivateKeyContainer.encryptForSelf(userSigner);
  const userBackupKeyShareOpts = {
    encryptedShare: encryptedUserBackup,
    type: KeyType.USER,
    encryptor: EncryptorType.RECOVERY,
  };
  await userManagementClient.uploadKeyshares(userId, walletId, [
    ...otherEncryptedShares,
    userBackupKeyShareOpts,
  ]);
  console.log('recovery:');
  console.log(JSON.stringify(recoveryPrivateKeyContainer));
  // TODO: add functionality to email recovery or distribute it somehow
  // distribute recovery right here
}
