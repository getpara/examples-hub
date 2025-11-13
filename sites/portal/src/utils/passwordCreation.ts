import {
  decryptWithPrivateKey,
  encryptPrivateKeyWithPassword,
  encryptWithDerivedPublicKey,
  getAsymmetricKeyPair,
  getPublicKeyHex,
  getSHA256HashHex,
  hashPasswordWithSalt,
} from '@getpara/web-sdk';
import { AuthMethodStatus, EncryptorType, KeyShareType } from '@getpara/user-management-client';
import { ParaPortal } from '../classes/ParaPortal';
import { checkIsEnclaveUser } from './checkIsEnclaveUser';

export async function passwordCreation(
  para: ParaPortal,
  {
    userId,
    partnerId,
    password,
    passwordId,
    isPIN,
    isForNewDevice,
    sessionId,
  }: {
    partnerId: string;
    userId: string;
    password: string;
    passwordId: string;
    isPIN?: boolean;
    isForNewDevice?: boolean;
    sessionId?: string;
  },
): Promise<void> {
  const keyPair = await getAsymmetricKeyPair(para.ctx);
  const publicKeyHex = getPublicKeyHex(keyPair);

  const { salt, hash: userHandle } = hashPasswordWithSalt(password);
  const encryptionKeyHash = getSHA256HashHex(userHandle);
  const encryptedPrivateKeyHex = await encryptPrivateKeyWithPassword(keyPair, userHandle);

  await para.ctx.client.patchSessionPassword(partnerId, userId, passwordId, {
    status: AuthMethodStatus.COMPLETE,
    sigDerivedPublicKey: publicKeyHex,
    salt: salt,
    encryptedWalletPrivateKey: encryptedPrivateKeyHex,
    encryptionKeyHash: encryptionKeyHash,
    isPIN,
  });

  // this means we are adding additional passwords to an existing account and need to encrypt
  // shares with new password
  // since we are redirecting to auth creation route from auth login route, the session initially
  // setup should still be available here
  if (isForNewDevice && sessionId) {
    const isEnclaveUser = await checkIsEnclaveUser({ para, sessionId });

    const temporaryShares = (await para.getTransmissionKeyShares({ isForNewDevice: true })).data.temporaryShares;
    const passwordEncryptedKeyshares = temporaryShares.map(share => {
      const decryptedShare = decryptWithPrivateKey(
        para.loginEncryptionKeyPair.privateKey,
        share.encryptedShare,
        share.encryptedKey,
      );
      const { encryptedMessageHex, encryptedKeyHex } = encryptWithDerivedPublicKey(publicKeyHex, decryptedShare);

      return {
        walletId: share.walletId,
        encryptedShare: encryptedMessageHex,
        encryptedKey: encryptedKeyHex,
        type: KeyShareType.USER,
        encryptor: EncryptorType.PASSWORD,
        partnerId: share.partnerId,
        passwordId,
      };
    });

    await para.ctx.client.uploadUserKeyShares(userId, passwordEncryptedKeyshares);

    if (isEnclaveUser) {
      await para.ctx.enclaveClient.deleteSharesWithRetry();
    }
  }
}
