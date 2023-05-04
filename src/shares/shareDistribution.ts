import { EncryptorType, KeyType } from '@usecapsule/user-management-client';

import { encryptWithDerivedPublicKey } from '../cryptography/utils';
import { sendRecoveryForShare } from './recovery';
import { Ctx } from '../definitions';

// function to call on new user share to perform all necessary distribution
export async function distributeNewShare(
  ctx: Ctx,
  userId: string,
  walletId: string,
  userShare: string,
  ignoreRedistributingBackupEncryptedShare = false
): Promise<string> {
  const publicKeysRes = await ctx.capsuleClient.getSessionPublicKeys(userId);
  const biometricEncryptedShares = publicKeysRes.data.keys.map((key) => {
    if (!key.publicKey) {
      return
    }
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
  }).filter(Boolean);
  return await sendRecoveryForShare(
    ctx,
    userId,
    walletId,
    biometricEncryptedShares,
    userShare,
    ignoreRedistributingBackupEncryptedShare,
  );
}
