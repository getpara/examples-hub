import {
  createCredential,
  decryptWithKeyPair,
  encryptWithDerivedPublicKey,
  getPublicKeyFromSignature,
  parseCredentialCreationRes,
} from '@usecapsule/web-sdk';
import { ENV } from '../constants';
import { EncryptorType, KeyType, PublicKeyStatus } from '@usecapsule/user-management-client';
import capsule from '../clients/capsule';
import { userManagementClient } from '../clients/userManagementClient';
import { CountryCallingCode } from 'libphonenumber-js';

export async function authCreation(
  partnerId: string,
  userId: string,
  email: string,
  phone: string,
  countryCode: CountryCallingCode,
  biometricId: string,
  isForNewDevice: boolean,
): Promise<void> {
  let identifier;

  if (email !== 'null' && email !== undefined && email !== '') {
    identifier = email;
  } else if (phone !== 'null' && phone !== undefined && phone !== '') {
    identifier = `${countryCode}${phone}`;
  }
  if (!identifier) {
    throw new Error('either a phone number or email address must be provided.');
  }

  const { creds, userHandle, algorithm } = await createCredential(ENV, userId, identifier);
  const { cosePublicKey, clientDataJSON } = parseCredentialCreationRes(creds, algorithm);
  const publicKeyHex = await getPublicKeyFromSignature(capsule.ctx, userHandle);
  await capsule.ctx.capsuleClient.patchSessionPublicKey(partnerId, userId, biometricId, {
    publicKey: creds.id,
    sigDerivedPublicKey: publicKeyHex,
    cosePublicKey,
    clientDataJSON,
    status: PublicKeyStatus.COMPLETE,
  });

  // this means we are adding additional biometrics to an existing account and need to encrypt
  // shares with new biometric
  // since we are redirecting to auth creation route from auth login route, the session initially
  // setup should still be available here
  if (isForNewDevice) {
    const temporaryShares = (await capsule.getTransmissionKeyShares(true)).data.temporaryShares;
    const biometricEncryptedKeyshares = temporaryShares.map((share) => {
      const decryptedShare = decryptWithKeyPair(capsule.loginEncryptionKeyPair, share.encryptedShare, share.encryptedKey);
      const { encryptedMessageHex, encryptedKeyHex } = encryptWithDerivedPublicKey(publicKeyHex, decryptedShare);

      return {
        walletId: share.walletId,
        encryptedShare: encryptedMessageHex,
        encryptedKey: encryptedKeyHex,
        type: KeyType.USER,
        encryptor: EncryptorType.BIOMETRICS,
        biometricPublicKey: publicKeyHex,
      };
    });

    await userManagementClient.uploadUserKeyShares(userId, biometricEncryptedKeyshares);
  }
}
