import Capsule, {
  createCredential,
  decryptWithPrivateKey,
  encryptWithDerivedPublicKey,
  getAsymmetricKeyPair,
  parseCredentialCreationRes,
  getPublicKeyHex,
  encryptPrivateKey,
  getSHA256HashHex,
} from '@usecapsule/web-sdk';
import { ENV } from '../constants';
import {
  AuthParams,
  EncryptorType,
  extractAuthInfo,
  KeyShareType,
  PublicKeyStatus,
} from '@usecapsule/user-management-client';

export type AuthCreationParams = AuthParams & {
  biometricId: string;
  partnerId: string;
  isForNewDevice: boolean;
  userId: string;
};

export async function authCreation(
  capsule: Capsule,
  { biometricId, isForNewDevice, partnerId, userId, ...authParams }: AuthCreationParams,
): Promise<void> {
  let identifier;

  const { authType, identifier: _identifier } = extractAuthInfo(authParams);

  switch (authType) {
    case 'farcasterUsername':
      identifier = `${_identifier}-farcaster`;
      break;
    default:
      identifier = _identifier;
      break;
  }

  const { creds, userHandle, algorithm } = await createCredential(ENV, userId, identifier, capsule.ctx.isE2E);
  const { cosePublicKey, clientDataJSON, aaguid } = parseCredentialCreationRes(creds, algorithm);
  const keyPair = await getAsymmetricKeyPair(capsule.ctx);
  const publicKeyHex = getPublicKeyHex(keyPair);

  const encryptionKeyHash = getSHA256HashHex(userHandle);
  const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandle);

  await capsule.ctx.capsuleClient.patchSessionPublicKey(partnerId, userId, biometricId, {
    publicKey: creds.id,
    sigDerivedPublicKey: publicKeyHex,
    cosePublicKey,
    clientDataJSON,
    status: PublicKeyStatus.COMPLETE,
    aaguid,
  });

  await capsule.ctx.capsuleClient.uploadEncryptedWalletPrivateKey(
    userId,
    encryptedPrivateKeyHex,
    encryptionKeyHash,
    creds.id,
  );

  // this means we are adding additional biometrics to an existing account and need to encrypt
  // shares with new biometric
  // since we are redirecting to auth creation route from auth login route, the session initially
  // setup should still be available here
  if (isForNewDevice) {
    const temporaryShares = (await capsule.getTransmissionKeyShares(true)).data.temporaryShares;
    const biometricEncryptedKeyshares = temporaryShares.map(share => {
      const decryptedShare = decryptWithPrivateKey(
        capsule.loginEncryptionKeyPair.privateKey,
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

    await capsule.ctx.capsuleClient.uploadUserKeyShares(userId, biometricEncryptedKeyshares);
  }
}
