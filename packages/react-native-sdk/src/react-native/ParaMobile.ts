import {
  AuthStateSignup,
  ConstructorOpts,
  ParaCore,
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
} from '@getpara/web-sdk';
import * as Sentry from '@sentry/react-native';

import { ReactNativeUtils } from './ReactNativeUtils.js';
import {
  Passkey,
  PasskeyCreateRequest,
  PasskeyCreateResult,
  PasskeyGetRequest,
  PasskeyGetResult,
} from 'react-native-passkey';
import { CurrentWalletIds, PublicKeyStatus, TWalletScheme } from '@getpara/user-management-client';
import { setEnv } from '../config.js';
import base64url from 'base64url';
import { webcrypto } from 'crypto';

const ES256_ALGORITHM = -7;
const RS256_ALGORITHM = -257;

/**
 * Represents a mobile implementation of the Para SDK.
 * @extends ParaCore
 *
 * @example
 * const para = new ParaMobile(Environment.BETA, "api_key");
 */
export class ParaMobile extends ParaCore {
  isNativePasskey = true;

  private relyingPartyId: string;
  /**
   * Creates an instance of ParaMobile.
   * @param {Environment} env - The environment to use (DEV, SANDBOX, BETA, or PROD).
   * @param {string} [apiKey] - The API key for authentication.
   * @param {string} [relyingPartyId] - The relying party ID for WebAuthn.
   * @param {ConstructorOpts} [opts] - Additional constructor options.
   */
  constructor(env: Environment, apiKey: string, relyingPartyId?: string, opts?: ConstructorOpts) {
    super(env, apiKey, opts);

    // starting with non-prod to see what kind of errors we get and if sensitive data is tracked
    // will turn on in prod after monitoring
    if (env !== Environment.PROD && env !== Environment.DEV) {
      Sentry.init({
        environment: env.toLowerCase(),
        dsn: 'https://59cea0cfbbb30a646c4e9f2feea06da4@o4504568036720640.ingest.us.sentry.io/4508850922323968',
      });
    }

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
   * Registers a passkey for the user.
   * @param {Auth<'email'> | Auth<'phone'>} auth - The user's authentication details
   * @param {string} biometricsId - The biometrics ID obtained from verification.
   * @returns {Promise<void>}
   */
  async registerPasskey(authState: AuthStateSignup) {
    if (!authState.passkeyId) {
      throw new Error('Passkey ID not found. Make sure you have enabled passkey logins in the Para Developer Portal.');
    }

    const userId = this.assertUserId();
    const authInfo = this.assertIsAuthSet();

    if (!webcrypto || !webcrypto.getRandomValues) {
      throw new Error('Web crypto is not available. Ensure you have imported the shim from @getpara/react-native-wallet.');
    }
    const userHandle = new Uint8Array(32);
    webcrypto.getRandomValues(userHandle);
    const userHandleEncoded = base64url.encode(userHandle as any);

    const requestJson: PasskeyCreateRequest = {
      authenticatorSelection: {
        authenticatorAttachment: 'platform' as any,
        requireResidentKey: true,
        residentKey: 'required' as any,
        userVerification: 'required' as any,
      },
      rp: {
        id: this.relyingPartyId,
        name: 'Para',
      },
      user: {
        id: userHandleEncoded,
        name: authInfo.identifier,
        displayName: authInfo.identifier,
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

    const { partnerId } = await this.ctx.client.touchSession();
    await this.ctx.client.patchSessionPublicKey(partnerId, userId, authState.passkeyId, {
      publicKey: resultJson.id,
      sigDerivedPublicKey: publicKeyHex,
      cosePublicKey,
      clientDataJSON,
      status: PublicKeyStatus.COMPLETE,
    });

    await this.ctx.client.uploadEncryptedWalletPrivateKey(userId, encryptedPrivateKeyHex, encryptionKeyHash, resultJson.id);
  }

  /**
   * Logs in the user using their authentication credentials.
   * @param {AuthParams} params - The authentication parameters.
   * @returns {Promise<void>}
   */
  async loginWithPasskey(): Promise<void> {
    this.assertIsAuthSet();
    const userId = this.assertUserId();

    const { challenge, allowedPublicKeys } = await this.ctx.client.getWebChallenge({ userId });

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

    const { partnerId, sessionLookupId } = await this.ctx.client.touchSession();
    const publicKey = resultJson.id;
    const verifyWebChallengeResult = await this.ctx.client.verifyWebChallenge(partnerId, {
      publicKey,
      signature: {
        clientDataJSON: resultJson.response.clientDataJSON,
        authenticatorData: resultJson.response.authenticatorData,
        signature: resultJson.response.signature,
      },
    });

    if (userId !== verifyWebChallengeResult.data.userId) {
      throw new Error('User ID mismatch');
    }

    const encryptedSharesResult = await this.ctx.client.getBiometricKeyshares(userId, resultJson.id);

    const encryptionKeyHash = getSHA256HashHex(resultJson.response.userHandle);
    const { encryptedPrivateKeys } = await this.ctx.client.getEncryptedWalletPrivateKeys(userId, encryptionKeyHash);

    let decryptedShares;
    if (encryptedPrivateKeys.length === 0) {
      decryptedShares = await getDerivedPrivateKeyAndDecrypt(
        this.ctx,
        resultJson.response.userHandle,
        encryptedSharesResult.data.keyShares,
      );
      const keyPair = await getAsymmetricKeyPair(this.ctx, resultJson.response.userHandle);
      const encryptedPrivateKeyHex = await encryptPrivateKey(keyPair, resultJson.response.userHandle);
      await this.ctx.client.uploadEncryptedWalletPrivateKey(
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

    const walletsRes = await this.ctx.client.getWallets(userId);
    const desiredWallets = walletsRes.data.wallets;

    const walletsToInsert: { [id: string]: Wallet } = {};
    for (let desiredWallet of desiredWallets) {
      const decryptedShare = decryptedShares.find(share => share.walletId === desiredWallet.id)!;
      walletsToInsert[decryptedShare.walletId] = {
        id: decryptedShare.walletId,
        signer: decryptedShare.signer,
        address: desiredWallet.address || undefined,
        publicKey: desiredWallet.publicKey || undefined,
        scheme: desiredWallet.scheme as TWalletScheme,
        type: desiredWallet.type || undefined,
      };
    }

    const currentWalletIds: CurrentWalletIds = {};
    for (const wallet of Object.values(walletsToInsert)) {
      const { id, type } = wallet;
      const currentIdsForType = currentWalletIds[type || 'EVM'] || [];
      currentWalletIds[type || 'EVM'] = [...currentIdsForType, id];
    }

    await this.setWallets(walletsToInsert);
    await this.setCurrentWalletIds(currentWalletIds, {
      sessionLookupId,
    });
  }
}
