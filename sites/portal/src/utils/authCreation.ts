import {
  createCredential,
  decryptWithPrivateKey,
  encryptWithDerivedPublicKey,
  getAsymmetricKeyPair,
  parseCredentialCreationRes,
  getPublicKeyHex,
  encryptPrivateKey,
  getSHA256HashHex,
} from '@getpara/web-sdk';
import { ENV } from '../constants';
import { AuthParams, EncryptorType, extractAuthInfo, KeyShareType, PublicKeyStatus } from '@getpara/user-management-client';
import { ParaPortal } from '../classes/ParaPortal';

export type AuthCreationParams = AuthParams & {
  biometricId: string;
  partnerId: string;
  isForNewDevice: boolean;
  userId: string;
};

export async function authCreation(
  para: ParaPortal,
  { biometricId, isForNewDevice, partnerId, userId, ...authParams }: AuthCreationParams,
): Promise<void> {
  const { publicKeyIdentifier } = extractAuthInfo(authParams, { isRequired: true });

  const { creds, userHandle, algorithm } = await createCredential(ENV, userId, publicKeyIdentifier, para.ctx.isE2E);
  const { cosePublicKey, clientDataJSON, aaguid } = parseCredentialCreationRes(creds, algorithm);
  const keyPair = await getAsymmetricKeyPair(para.ctx);
  const publicKeyHex = getPublicKeyHex(keyPair);

  const encryptionKeyHash = getSHA256HashHex(userHandle);
  const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandle);

  await para.ctx.client.patchSessionPublicKey(partnerId, userId, biometricId, {
    publicKey: creds.id,
    sigDerivedPublicKey: publicKeyHex,
    cosePublicKey,
    clientDataJSON,
    status: PublicKeyStatus.COMPLETE,
    aaguid,
  });

  await para.ctx.client.uploadEncryptedWalletPrivateKey(userId, encryptedPrivateKeyHex, encryptionKeyHash, creds.id);

  // this means we are adding additional biometrics to an existing account and need to encrypt
  // shares with new biometric
  // since we are redirecting to auth creation route from auth login route, the session initially
  // setup should still be available here
  if (isForNewDevice) {
    const temporaryShares = (await para.getTransmissionKeyShares({ isForNewDevice: true })).data.temporaryShares;
    const biometricEncryptedKeyshares = temporaryShares.map(share => {
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
        encryptor: EncryptorType.BIOMETRICS,
        biometricPublicKey: publicKeyHex,
        partnerId: share.partnerId,
      };
    });

    await para.ctx.client.uploadUserKeyShares(userId, biometricEncryptedKeyshares);
  }
}
