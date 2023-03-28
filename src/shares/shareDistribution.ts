import { EncryptorType, KeyType } from '@capsule/client';

import { encryptWithDerivedPublicKey } from '../cryptography/utils';
import { sendRecoveryForShare } from './recovery';
import { userManagementClient } from '../external/userManagementClient';

// function to call on new user share to perform all necessary distribution
export async function distributeNewShare(
  userId: string,
  walletId: string,
  userShare: string
): Promise<void> {
  const publicKeysRes = await userManagementClient.getSessionPublicKeys(userId);
  const biometricEncryptedShares = publicKeysRes.data.keys.map((key) => {
    // TODO add some sort of support/check to work for mobile biometrics
    // if (key.biometricType !== 'WEB') {
    //   // TODO: also encrypt with biometric public key from mobile and persist in backend
    //   throw new Error('only support type WEB biometrics for web wallets');
    // }

    const { encryptedMessageHex, encryptedKeyHex } =
      encryptWithDerivedPublicKey(key.sigDerivedPublicKey, userShare);
    return {
      encryptedShare: encryptedMessageHex,
      encryptedKey: encryptedKeyHex,
      type: KeyType.USER,
      encryptor: EncryptorType.BIOMETRICS,
      biometricPublicKey: key.sigDerivedPublicKey,
    };
  });
  await sendRecoveryForShare(
    userId,
    walletId,
    biometricEncryptedShares,
    userShare
  );
}

export async function uploadSharesForNewBiometric(
  userId: string,
  biometric: any,
  userKeyShares: { walletId: string; signer: string }[]
): Promise<void> {
  const newEncryptedShares = userKeyShares.map((share) => {
    const { encryptedMessageHex, encryptedKeyHex } =
      encryptWithDerivedPublicKey(biometric.sigDerivedPublicKey, share.signer);
    return {
      walletId: share.walletId,
      encryptedShare: encryptedMessageHex,
      encryptedKey: encryptedKeyHex,
      type: KeyType.USER,
      encryptor: EncryptorType.BIOMETRICS,
      biometricPublicKey: biometric.sigDerivedPublicKey,
    };
  });
  await userManagementClient.uploadUserKeyShares(userId, newEncryptedShares);
}
