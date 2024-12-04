// Copyright (c) Capsule Labs Inc. All rights reserved.

import {
  ConstructorOpts,
  CoreCapsule,
  Environment,
  PlatformUtils,
  Wallet,
  decryptPrivateKeyAndDecryptShare,
  encryptPrivateKey,
  getAsymmetricKeyPair,
  getDerivedPrivateKeyAndDecrypt,
  getPublicKeyHex,
  getSHA256HashHex,
  parseCredentialCreationRes,
} from '@usecapsule/web-sdk';
import { ReactNativeUtils } from './ReactNativeUtils.js';
import {
  Passkey,
  PasskeyCreateRequest,
  PasskeyCreateResult,
  PasskeyGetRequest,
  PasskeyGetResult,
} from 'react-native-passkey';
import { extractAuth, PublicKeyStatus, WalletScheme } from '@usecapsule/user-management-client';
import { setEnv } from '../config.js';
import base64url from 'base64url';
import { webcrypto } from 'crypto';
import { CountryCallingCode } from 'libphonenumber-js';

const ES256_ALGORITHM = -7;
const RS256_ALGORITHM = -257;

/**
 * Represents a mobile implementation of the Capsule SDK.
 * @extends CoreCapsule
 */
export class CapsuleMobile extends CoreCapsule {
  private relyingPartyId: string;
  /**
   * Creates an instance of CapsuleMobile.
   * @param {Environment} env - The environment to use (DEV, SANDBOX, BETA, or PROD).
   * @param {string} [apiKey] - The API key for authentication.
   * @param {string} [relyingPartyId] - The relying party ID for WebAuthn.
   * @param {ConstructorOpts} [opts] - Additional constructor options.
   */
  constructor(env: Environment, apiKey?: string, relyingPartyId?: string, opts?: ConstructorOpts) {
    super(env, apiKey, opts);

    setEnv(env);

    if (relyingPartyId) {
      this.relyingPartyId = relyingPartyId;
    } else {
      switch (env) {
        case Environment.DEV:
          throw new Error('relyingPartyId is required');
        case Environment.SANDBOX:
          this.relyingPartyId = 'app.sandbox.usecapsule.com';
          break;
        case Environment.BETA:
          this.relyingPartyId = 'app.beta.usecapsule.com';
          break;
        case Environment.PROD:
          this.relyingPartyId = 'app.usecapsule.com';
          break;
      }
    }
  }

  protected getPlatformUtils(): PlatformUtils {
    return new ReactNativeUtils();
  }

  /**
   * Verifies an email and returns the biometrics ID.
   * @param {string} verificationCode - The verification code sent to the email.
   * @returns {Promise<string>} The biometrics ID.
   */
  async verifyEmailBiometricsId(verificationCode: string): Promise<string> {
    const webAuthCreateUrl = await super.verifyEmail(verificationCode);
    const segments = webAuthCreateUrl.split('/');
    const segments2 = segments[segments.length - 1]!.split('?');
    const biometricsId = segments2[0]!;

    return biometricsId;
  }

  /**
   * Verifies a phone number and returns the biometrics ID.
   * @param {string} verificationCode - The verification code sent to the phone.
   * @returns {Promise<string>} The biometrics ID.
   */
  async verifyPhoneBiometricsId(verificationCode: string): Promise<string> {
    const webAuthCreateUrl = await super.verifyPhone(verificationCode);
    const segments = webAuthCreateUrl.split('/');
    const segments2 = segments[segments.length - 1]!.split('?');
    const biometricsId = segments2[0]!;

    return biometricsId;
  }

  /**
   * Registers a passkey for the user.
   * @param {string} identifier - The user's email or phone number.
   * @param {string} biometricsId - The biometrics ID obtained from verification.
   * @param {webcrypto.Crypto} crypto - The Web Crypto API instance.
   * @param {'email' | 'phone'} [identifierType='email'] - The type of identifier used.
   * @param {CountryCallingCode} [countryCode] - The country calling code for phone numbers.
   * @returns {Promise<void>}
   */
  async registerPasskey(
    identifier: string,
    biometricsId: string,
    crypto: webcrypto.Crypto,
    identifierType: 'email' | 'phone' = 'email',
    countryCode?: CountryCallingCode,
  ) {
    const userHandle = new Uint8Array(32);
    crypto.getRandomValues(userHandle);
    const userHandleEncoded = base64url.encode(userHandle as any);

    const displayIdentifier = identifierType === 'email' ? identifier : `${countryCode}${identifier}`;

    const requestJson: PasskeyCreateRequest = {
      authenticatorSelection: {
        authenticatorAttachment: 'platform' as any,
        requireResidentKey: true,
        residentKey: 'required' as any,
        userVerification: 'required' as any,
      },
      rp: {
        id: this.relyingPartyId,
        name: 'Capsule',
      },
      user: {
        id: userHandleEncoded,
        name: displayIdentifier,
        displayName: displayIdentifier,
      },
      pubKeyCredParams: [
        {
          type: 'public-key',
          alg: ES256_ALGORITHM,
        },
        {
          type: 'public-key',
          alg: RS256_ALGORITHM,
        },
      ],
      attestation: 'direct' as any,
      timeout: 60000,
      challenge: base64url.encode('somechallenge'),
    };

    const result: PasskeyCreateResult = await Passkey.create(requestJson);
    let resultJson;

    if (typeof result === 'string') {
      resultJson = JSON.parse(result);
    } else {
      resultJson = result;
    }

    const { cosePublicKey, clientDataJSON } = parseCredentialCreationRes(resultJson, ES256_ALGORITHM);

    const keyPair = await getAsymmetricKeyPair(this.ctx);
    const publicKeyHex = getPublicKeyHex(keyPair);

    const encryptionKeyHash = getSHA256HashHex(userHandleEncoded);
    const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, userHandleEncoded);

    const session = await this.ctx.capsuleClient.touchSession();
    await this.ctx.capsuleClient.patchSessionPublicKey(session.data.partnerId, this.getUserId()!, biometricsId, {
      publicKey: resultJson.id,
      sigDerivedPublicKey: publicKeyHex,
      cosePublicKey,
      clientDataJSON,
      status: PublicKeyStatus.COMPLETE,
    });

    await this.ctx.capsuleClient.uploadEncryptedWalletPrivateKey(
      this.getUserId()!,
      encryptedPrivateKeyHex,
      encryptionKeyHash,
      resultJson.id,
    );
  }

  /**
   * Logs in the user using either email or phone number.
   * @param {string} [email] - The user's email address.
   * @param {string} [phone] - The user's phone number.
   * @param {CountryCallingCode} [countryCode] - The country calling code for phone numbers.
   * @returns {Promise<Wallet[]>} An array of user wallets.
   * @throws {Error} If neither email nor both phone and countryCode are provided.
   */
  async login(email?: string, phone?: string, countryCode?: CountryCallingCode): Promise<void> {
    const auth = extractAuth({ email, phone, countryCode });
    const { challenge, allowedPublicKeys } = await this.ctx.capsuleClient.getWebChallenge({
      auth,
    });

    const requestJson: PasskeyGetRequest = {
      challenge,
      timeout: 60000,
      rpId: this.relyingPartyId,
      allowCredentials: allowedPublicKeys?.[0] ? [{ type: 'public-key', id: allowedPublicKeys[0] }] : [],
    };

    const result: PasskeyGetResult = await Passkey.get(requestJson);

    let resultJson;

    if (typeof result === 'string') {
      resultJson = JSON.parse(result);
    } else {
      resultJson = result;
    }

    const session = await this.ctx.capsuleClient.touchSession();
    const verifyWebChallengeResult = await this.ctx.capsuleClient.verifyWebChallenge(session.data.partnerId, {
      publicKey: resultJson.id,
      signature: {
        clientDataJSON: resultJson.response.clientDataJSON,
        authenticatorData: resultJson.response.authenticatorData,
        signature: resultJson.response.signature,
      },
    });

    const userId = verifyWebChallengeResult.data.userId;

    await this.setUserId(userId);

    const encryptedSharesResult = await this.ctx.capsuleClient.getBiometricKeyshares(userId, resultJson.id);

    const encryptionKeyHash = getSHA256HashHex(resultJson.response.userHandle);
    const { encryptedPrivateKeys } = await this.ctx.capsuleClient.getEncryptedWalletPrivateKeys(userId, encryptionKeyHash);

    let decryptedShares;
    if (encryptedPrivateKeys.length === 0) {
      decryptedShares = await getDerivedPrivateKeyAndDecrypt(
        this.ctx,
        resultJson.response.userHandle,
        encryptedSharesResult.data.keyShares,
      );
      const keyPair = await getAsymmetricKeyPair(this.ctx, resultJson.response.userHandle);
      const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, resultJson.response.userHandle);
      await this.ctx.capsuleClient.uploadEncryptedWalletPrivateKey(
        userId,
        encryptedPrivateKeyHex,
        encryptionKeyHash,
        resultJson.id,
      );
    } else {
      decryptedShares = await decryptPrivateKeyAndDecryptShare(
        resultJson.response.userHandle,
        encryptedSharesResult.data.keyShares,
        encryptedPrivateKeys[0].encryptedPrivateKey,
      );
    }

    const walletsRes = await this.ctx.capsuleClient.getWallets(userId);
    const desiredWallets = walletsRes.data.wallets;

    const walletsToInsert: { [id: string]: Wallet } = {};
    for (let desiredWallet of desiredWallets) {
      const decryptedShare = decryptedShares.find(share => share.walletId === desiredWallet.id)!;
      walletsToInsert[decryptedShare.walletId] = {
        id: decryptedShare.walletId,
        signer: decryptedShare.signer,
        address: desiredWallet.address || undefined,
        publicKey: desiredWallet.publicKey || undefined,
        scheme: desiredWallet.scheme as WalletScheme,
      };
    }

    await this.setWallets(walletsToInsert);
  }
}
