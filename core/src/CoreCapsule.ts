import {
  PublicKeyStatus,
  PublicKeyType,
} from '@usecapsule/user-management-client';
import { pki, jsbn } from 'node-forge';

import {
  decryptWithKeyPair,
  getAsymmetricKeyPair,
  getPublicKeyHex,
} from './cryptography/utils';
import { Ctx, getPortalBaseURL } from './definitions';
import { Environment } from './definitions';
import { getBaseUrl, initClient } from './external/capsuleClient';
import * as mpcComputationClient from './external/mpcComputationClient';
import { distributeNewShare } from './shares/shareDistribution';
import {
  FullSignatureRes,
  SuccessfulSignatureRes,
  DeniedSignatureRes,
} from './types/walletTypes';
import * as transmissionUtils from './transmission/transmissionUtils';
import { PlatformUtils } from './PlatformUtils';

// amount of time in ms that a web auth session lasts
const BIOMETRIC_VERIFICATION_TIME_MS = 30 * 60 * 1000;
const DEV_BIOMETRIC_VERIFICATION_TIME_MS = 60 * 60 * 1000;

enum WalletScheme {
  CGGMP = 'CGGMP',
  DKLS = 'DKLS',
}

// Make sure to keep this in sync with capsule-org/src/entities/recoveryAttemptEntity.ts
export enum RecoveryStatus {
  INITIATED = 'INITIATED',
  READY = 'READY',
  EXPIRED = 'EXPIRED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export interface Wallet {
  id: string;
  signer: string;
  address?: string;
  publicKey?: string;
  scheme?: WalletScheme;
}

export interface ConstructorOpts {
  useStorageOverrides?: boolean;
  disableWorkers?: boolean;
  offloadMPCComputationURL?: string;
  useLocalFiles?: boolean;
  localStorageGetItemOverride?: (key: string) => Promise<string | null>;
  localStorageSetItemOverride?: (key: string, value: string) => Promise<void>;
  sessionStorageGetItemOverride?: (key: string) => Promise<string | null>;
  sessionStorageSetItemOverride?: (key: string, value: string) => Promise<void>;
  sessionStorageRemoveItemOverride?: (key: string) => Promise<void>;
  clearStorageOverride?: () => Promise<void>;
  portalBackgroundColor?: string; // please use hex color codes
  portalPrimaryButtonColor?: string; // please use hex color codes
  portalTextColor?: string; // please use hex color codes
  portalPrimaryButtonTextColor?: string; // please use hex color codes
  useDKLSForCreation?: boolean;
  disableWebSockets?: boolean;
  wasmOverride?: ArrayBuffer;
}

const PREFIX = '@CAPSULE/';
const LOCAL_STORAGE_EMAIL = `${PREFIX}e-mail`;
const LOCAL_STORAGE_USER_ID = `${PREFIX}userId`;
const LOCAL_STORAGE_WALLETS = `${PREFIX}wallets`;
const LOCAL_STORAGE_SESSION_COOKIE = `${PREFIX}sessionCookie`;
const SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR = `${PREFIX}loginEncryptionKeyPair`;
const POLLING_INTERVAL_MS = 2000;
const SHORT_POLLING_INTERVAL_MS = 1000;

const EMPTY_FUNCTION = () => {};

function biometricVerifiedRecently(ctx: Ctx, verifiedAt: number): boolean {
  if (ctx.env !== Environment.PROD) {
    return Date.now() - verifiedAt <= DEV_BIOMETRIC_VERIFICATION_TIME_MS;
  }
  return Date.now() - verifiedAt <= BIOMETRIC_VERIFICATION_TIME_MS;
}

export abstract class CoreCapsule {
  ctx: Ctx;

  private email?: string;
  private userId?: string;
  private wallets?: Record<string, Wallet>;
  private sessionCookie?: string;

  /**
   * Encryption key pair generated from loginEncryptionKey.
   */
  loginEncryptionKeyPair?: pki.rsa.KeyPair;

  /**
   * Hex color to use in the portal for the background color.
   */
  portalBackgroundColor?: string;

  /**
   * Hex color to use in the portal for the primary button.
   */
  portalPrimaryButtonColor?: string;

  /**
   * Hex text color to use in the portal.
   */
  portalTextColor?: string;

  /**
   * Hex color to use in the portal for the primary button text.
   */
  portalPrimaryButtonTextColor?: string;
  private disableProviderModal?: boolean;

  private platformUtils: PlatformUtils;

  private localStorageGetItem = (key: string): Promise<string | null> | string | null => {
    return this.platformUtils.localStorage.get(key);
  };
  private localStorageSetItem = (key: string, value: string): Promise<void> | void => {
    return this.platformUtils.localStorage.set(key, value);
  };
  private sessionStorageGetItem = (key: string): Promise<string | null> | string | null => {
    return this.platformUtils.sessionStorage.get(key);
  };
  private sessionStorageSetItem = (key: string, value: string): Promise<void> | void => {
    return this.platformUtils.sessionStorage.set(key, value);
  };
  private sessionStorageRemoveItem = (key: string): Promise<void> | void => {
    return this.platformUtils.sessionStorage.removeItem(key);
  };
  retrieveSessionCookie = (): string | undefined => {
    return this.sessionCookie;
  };
  persistSessionCookie = (cookie: string): void => {
    this.sessionCookie = cookie;
    this.localStorageSetItem(LOCAL_STORAGE_SESSION_COOKIE, cookie);
  };

  /**
   * Remove all local storage and prefixed session storage.
   */
  clearStorage = async (): Promise<void> => {
    this.platformUtils.localStorage.clear(PREFIX);
    this.platformUtils.sessionStorage.clear(PREFIX);
    if (this.platformUtils.secureStorage) {
      this.platformUtils.secureStorage.clear(PREFIX);
    }
  }

  private convertBigInt(bigInt: Record<string, any>): jsbn.BigInteger {
    const convertedBigInt = new jsbn.BigInteger(null);
    convertedBigInt.data = bigInt.data;
    convertedBigInt.s = bigInt.s;
    convertedBigInt.t = bigInt.t;
    return convertedBigInt;
  }

  private convertEncryptionKeyPair(jsonKeyPair: Record<string, any>): pki.rsa.KeyPair {
    return {
      privateKey: pki.setRsaPrivateKey(
        this.convertBigInt(jsonKeyPair.privateKey.n),
        this.convertBigInt(jsonKeyPair.privateKey.e),
        this.convertBigInt(jsonKeyPair.privateKey.d),
        this.convertBigInt(jsonKeyPair.privateKey.p),
        this.convertBigInt(jsonKeyPair.privateKey.q),
        this.convertBigInt(jsonKeyPair.privateKey.dP),
        this.convertBigInt(jsonKeyPair.privateKey.dQ),
        this.convertBigInt(jsonKeyPair.privateKey.qInv),
      ),
      publicKey: pki.setRsaPublicKey(
        this.convertBigInt(jsonKeyPair.publicKey.n),
        this.convertBigInt(jsonKeyPair.publicKey.e),
      ),
    };
  }

  private requireApiKey() {
    if (!this.ctx.apiKey) {
      throw new Error(
        `in order to create a wallet or user with Capsule, you
        must provide an API key to the capsule instance`
      );
    }
  }

  protected abstract getPlatformUtils(): PlatformUtils;

  /**
   * Constructs a new `CoreCapsule` instance.
   * @param env - `Environment` to use.
   * @param apiKey - API key to use.
   * @param opts - Additional constructor options; see `ConstructorOpts`.
   * @returns - A new CoreCapsule instance.
   */
  constructor(env: Environment, apiKey?: string, opts?: ConstructorOpts) {
    // TODO: consider using sessionStorage instead of localStorage
    if (!opts) opts = {};

    this.portalBackgroundColor = opts.portalBackgroundColor;
    this.portalPrimaryButtonColor = opts.portalPrimaryButtonColor;
    this.portalTextColor = opts.portalTextColor;
    this.portalPrimaryButtonTextColor = opts.portalPrimaryButtonTextColor;

    this.platformUtils = this.getPlatformUtils();
    this.disableProviderModal = this.platformUtils.disableProviderModal;

    if (opts.useStorageOverrides) {
      this.localStorageGetItem = opts.localStorageGetItemOverride;
      this.localStorageSetItem = opts.localStorageSetItemOverride;
      this.sessionStorageGetItem = opts.sessionStorageGetItemOverride;
      this.sessionStorageSetItem = opts.sessionStorageSetItemOverride;
      this.sessionStorageRemoveItem = opts.sessionStorageRemoveItemOverride;
      this.clearStorage = opts.clearStorageOverride;
    }
  
    this.ctx = {
      env,
      apiKey,
      capsuleClient: initClient(env, apiKey, opts.disableWorkers, this.retrieveSessionCookie, this.persistSessionCookie),
      disableWorkers: opts.disableWorkers,
      offloadMPCComputationURL: opts.offloadMPCComputationURL,
      useLocalFiles: opts.useLocalFiles,
      useDKLS: opts.useDKLSForCreation || !opts.offloadMPCComputationURL,
      disableWebSockets: !!opts.disableWebSockets,
      wasmOverride: opts.wasmOverride,
    };
    if (opts.offloadMPCComputationURL) {
      this.ctx.mpcComputationClient = mpcComputationClient.initClient(opts.offloadMPCComputationURL, opts.disableWorkers);
    }

    if (!this.platformUtils.isSyncStorage || opts.useStorageOverrides) {
      return;
    }

    this.email = this.localStorageGetItem(LOCAL_STORAGE_EMAIL) as string || undefined;
    this.userId = this.localStorageGetItem(LOCAL_STORAGE_USER_ID) as string || undefined;
    // TODO: remove sessionStorageGetItem call once new version is being consumed
    this.sessionCookie = this.localStorageGetItem(LOCAL_STORAGE_SESSION_COOKIE) as string || this.sessionStorageGetItem(LOCAL_STORAGE_SESSION_COOKIE) as string || undefined;

    const stringWallets = this.platformUtils.secureStorage ?
      this.platformUtils.secureStorage.get(LOCAL_STORAGE_WALLETS) :
      this.localStorageGetItem(LOCAL_STORAGE_WALLETS);
    this.wallets = JSON.parse(stringWallets as string || '{}');

    const loginEncryptionKey = this.sessionStorageGetItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR) as string | null;
    if (loginEncryptionKey && loginEncryptionKey !== 'undefined') {
      this.loginEncryptionKeyPair = this.convertEncryptionKeyPair(JSON.parse(loginEncryptionKey));
    }
  }

  /**
   * Initialize storage relating to a `CoreCapsule` instance.
   *
   * Init only needs to be called for storage that is async.
   */
  async init(): Promise<void> {
    this.email = await this.localStorageGetItem(LOCAL_STORAGE_EMAIL) || undefined;
    this.userId = await this.localStorageGetItem(LOCAL_STORAGE_USER_ID) || undefined;
    // TODO: remove sessionStorageGetItem call once new version is being consumed
    this.sessionCookie = await this.localStorageGetItem(LOCAL_STORAGE_SESSION_COOKIE) || await this.sessionStorageGetItem(LOCAL_STORAGE_SESSION_COOKIE) || undefined;

    const stringWallets = this.platformUtils.secureStorage ?
      await this.platformUtils.secureStorage.get(LOCAL_STORAGE_WALLETS) :
      await this.localStorageGetItem(LOCAL_STORAGE_WALLETS);
    this.wallets = JSON.parse(stringWallets || '{}');

    const loginEncryptionKey = await this.sessionStorageGetItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR);
    if (loginEncryptionKey && loginEncryptionKey !== 'undefined') {
      this.loginEncryptionKeyPair = this.convertEncryptionKeyPair(JSON.parse(loginEncryptionKey));
    }
  }

  /**
   * Sets the email associated with the `CoreCapsule` instance.
   * @param email - Email to set.
   */
  async setEmail(email: string): Promise<void> {
    this.email = email;
    await this.localStorageSetItem(LOCAL_STORAGE_EMAIL, email);
  }

  /**
   * Sets the user id associated with the `CoreCapsule` instance.
   * @param userId - User id to set.
   */
  async setUserId(userId: string): Promise<void> {
    this.userId = userId;
    await this.localStorageSetItem(LOCAL_STORAGE_USER_ID, userId);
  }

  /**
   * Sets the wallets associated with the `CoreCapsule` instance.
   * @param wallets - Wallets to set.
   */
  async setWallets(wallets: Record<string, Wallet>): Promise<void> {
    this.wallets = wallets;
    if (this.platformUtils.secureStorage) {
      await this.platformUtils.secureStorage.set(LOCAL_STORAGE_WALLETS, JSON.stringify(wallets));
      return;
    }
    await this.localStorageSetItem(LOCAL_STORAGE_WALLETS, JSON.stringify(wallets));
  }

  /**
   * Sets the login encryption key pair associated with the `CoreCapsule` instance.
   * @param keyPair - Encryption key pair generated from loginEncryptionKey.
   */
  async setLoginEncryptionKeyPair(keyPair: pki.rsa.KeyPair): Promise<void> {
    this.loginEncryptionKeyPair = keyPair;
    await this.sessionStorageSetItem(
      SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR,
      JSON.stringify(keyPair),
    );
  }

  private async deleteLoginEncryptionKeyPair(): Promise<void> {
    this.loginEncryptionKeyPair = undefined;
    await this.sessionStorageRemoveItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR);
  }

  /**
   * Gets the userId associated with the `CoreCapsule` instance.
   * @returns - userId associated with the `CoreCapsule` instance.
   */
  getUserId(): string | undefined {
    return this.userId;
  }

  /**
   * Gets the email associated with the `CoreCapsule` instance.
   * @returns - email associated with the `CoreCapsule` instance.
   */
  getEmail(): string | undefined {
    return this.email;
  }

  /**
   * Gets the wallets associated with the `CoreCapsule` instance.
   * @returns - wallets associated with the `CoreCapsule` instance.
   */
  getWallets(): Record<string, Wallet> {
    return this.wallets;
  }

  private async getPartnerURL(partnerId: string): Promise<string | undefined> {
    const res = await this.ctx.capsuleClient.getPartner(partnerId);
    return res.data.partner.portalUrl;
  }

  /**
   * URL of the portal, which can be associated with a partner id
   * @param partnerId - id of the partner to get the portal URL for
   * @returns - portal URL
   */
  async getPortalURL(partnerId?: string): Promise<string> {
    return (partnerId && await this.getPartnerURL(partnerId)) || getPortalBaseURL(this.ctx);
  }

  private async getWebAuthURLForCreate(
    webAuthId: string,
    partnerId?: string,
    isForNewDevice?: boolean,
  ): Promise<string> {
    const partnerIdQueryParam = partnerId ? `&partnerId=${partnerId}` : '';
    const portalBackgroundColorQueryParam = this.portalBackgroundColor ? `&portalBackgroundColor=${encodeURIComponent(this.portalBackgroundColor)}` : '';
    const portalPrimaryButtonColorQueryParam = this.portalPrimaryButtonColor ? `&portalPrimaryButtonColor=${encodeURIComponent(this.portalPrimaryButtonColor)}` : '';
    const portalTextColorQueryParam = this.portalTextColor ? `&portalTextColor=${encodeURIComponent(this.portalTextColor)}` : '';
    const portalPrimaryButtonTextColorQueryParam = this.portalPrimaryButtonTextColor ? `&portalPrimaryButtonTextColor=${encodeURIComponent(this.portalPrimaryButtonTextColor)}` : '';
    const isForNewDeviceQueryParam = isForNewDevice ? `&isForNewDevice=${isForNewDevice}` : '';

    return `${(partnerId && await this.getPartnerURL(partnerId)) || getPortalBaseURL(this.ctx)}/web/users/${
      this.userId
    }/biometrics/${webAuthId}?email=${encodeURIComponent(
      this.email,
    )}${partnerIdQueryParam}${portalBackgroundColorQueryParam}${portalPrimaryButtonColorQueryParam}${portalTextColorQueryParam}${isForNewDeviceQueryParam}${portalPrimaryButtonTextColorQueryParam}`;
  }

  private getShortUrl(compressedUrl: string): string {
    return `${getPortalBaseURL(this.ctx)}/short/${compressedUrl}`;
  }

  async shortenLoginLink(link: string): Promise<string> {
    const url = await transmissionUtils.upload(link, this.ctx.capsuleClient);
    return this.getShortUrl(url);
  }

  /**
   * Generates a URL that can be used to perform web auth
   * for creating a new credential.
   * @param sessionId - id of the session to use for web auth
   * @param loginEncryptionPublicKey - public key to use for encrypting the login encryption key
   * @param partnerId - id of the partner to get the portal URL for
   * @param newDeviceSessionId - id of the session to use for web auth for a new device
   * @param newDeviceEncryptionKey - public key to use for encrypting the login encryption key for a new device
   * @returns - web auth url
   */
  async getWebAuthURLForLogin(
    sessionId: string,
    loginEncryptionPublicKey: string,
    partnerId?: string,
    newDeviceSessionId?: string,
    newDeviceEncryptionKey?: string,
  ): Promise<string> {
    const partnerIdQueryParam = partnerId ? `&partnerId=${partnerId}` : '';
    const portalBackgroundColorQueryParam = this.portalBackgroundColor ? `&portalBackgroundColor=${encodeURIComponent(this.portalBackgroundColor)}` : '';
    const portalPrimaryButtonColorQueryParam = this.portalPrimaryButtonColor ? `&portalPrimaryButtonColor=${encodeURIComponent(this.portalPrimaryButtonColor)}` : '';
    const portalTextColorQueryParam = this.portalTextColor ? `&portalTextColor=${encodeURIComponent(this.portalTextColor)}` : '';
    const portalPrimaryButtonTextColorQueryParam = this.portalPrimaryButtonTextColor ? `&portalPrimaryButtonTextColor=${encodeURIComponent(this.portalPrimaryButtonTextColor)}` : '';
    const newDeviceSessionIdQueryParam = newDeviceSessionId ? `&newDeviceSessionId=${newDeviceSessionId}` : '';
    const newDeviceEncryptionKeyQueryParam = newDeviceEncryptionKey ? `&newDeviceEncryptionKey=${newDeviceEncryptionKey}` : '';

    return `${(partnerId && await this.getPartnerURL(partnerId)) || getPortalBaseURL(this.ctx)}/web/biometrics/login?email=${encodeURIComponent(
      this.email,
    )}&sessionId=${sessionId}&encryptionKey=${loginEncryptionPublicKey}${partnerIdQueryParam}${portalBackgroundColorQueryParam}${portalPrimaryButtonColorQueryParam}${
      portalTextColorQueryParam
    }${newDeviceSessionIdQueryParam}${newDeviceEncryptionKeyQueryParam}${portalPrimaryButtonTextColorQueryParam}`;
  }

  /**
   * Fetches the wallets associated with the user.
   * @returns - wallets that were fetched.
   */
  async fetchWallets(): Promise<any[]> {
    const res = await this.ctx.capsuleClient.getWallets(this.userId);
    return res.data.wallets;
  }

  private async populateWalletAddresses(): Promise<void> {
    const res = await this.ctx.capsuleClient.getWallets(this.userId);
    const wallets = res.data.wallets;
    wallets.forEach((wallet: { id: string; address?: string; publicKey?: string; scheme?: WalletScheme }) => {
      if (this.wallets[wallet.id]) {
        this.wallets[wallet.id].address = wallet.address;
        this.wallets[wallet.id].publicKey = wallet.publicKey;
        this.wallets[wallet.id].scheme = wallet.scheme;
      }
    });
    await this.setWallets(this.wallets);
  }

  /**
   * Checks if a user exists.
   * @returns - true if user exists, false otherwise.
   */
  async checkIfUserExists(email: string): Promise<boolean> {
    const res = await this.ctx.capsuleClient.checkUserExists(email);
    return res.data.exists;
  }

  /**
   * Creates a new user.
   * @param email - email to use for creating the user.
   */
  async createUser(email: string): Promise<void> {
    this.requireApiKey();
    await this.setEmail(email);
    const { userId } = await this.ctx.capsuleClient.createUser({
      email: this.email,
    });
    await this.setUserId(userId);
  }

  /**
   * Passes the email code obtained from the user for verification.
   * @param verificationCode
   * @returns - web auth url for creating a new credential
   */
  async verifyEmail(verificationCode: string): Promise<string> {
    await this.ctx.capsuleClient.verifyEmail(this.userId, { verificationCode });
    return this.getSetUpBiometricsURL(false);
  }

  /**
   * Performs 2FA verification.
   * @param email - email to use for performing a 2FA verification.
   * @param verificationCode - verification code to received via 2FA.
   * @returns { address, initiatedAt, status, userId, walletId }
   */
  async verify2FA(email: string, verificationCode: string): Promise<{
    address?: string;
    initiatedAt?: Date;
    status?: RecoveryStatus;
    userId: string;
    walletId: string;
  }> {
    const res = await this.ctx.capsuleClient.verify2FA(email, verificationCode);
    return {
      address: res.data.address,
      initiatedAt: res.data.initiatedAt,
      status: res.data.status,
      userId: res.data.userId,
      walletId: res.data.walletId,
    }
  }

  /**
   * Sets up 2FA.
   * @returns uri - uri to use for setting up 2FA
   * */
  async setup2FA(): Promise<{
    uri?: string
  }> {
    const res = await this.ctx.capsuleClient.setup2FA(this.userId);
    return {
      uri: res.data.uri,
    }
  }

  /**
   * Enables 2FA.
   * @param verificationCode - verification code received via 2FA.
   */
  async enable2FA(verificationCode: string): Promise<void> {
    await this.ctx.capsuleClient.enable2FA(this.userId, verificationCode);
  }

  /**
   * Determines if 2FA has been set up.
   * @returns { isSetup } - true if 2FA is setup, false otherwise
   */
  async check2FAStatus(): Promise<{
    isSetup: boolean
  }> {
    if (!this.userId) {
      return { isSetup: false }
    }
    const res = await this.ctx.capsuleClient.check2FAStatus(this.userId);
    return {
      isSetup: res.data.isSetup
    }
  }

  async resendVerificationCode(): Promise<void> {
    await this.ctx.capsuleClient.resendVerificationCode(this.userId);
  }

  // returns web auth url for creating a new credential
  async getSetUpBiometricsURL(isForNewDevice: boolean): Promise<string> {
    const res = await this.ctx.capsuleClient.addSessionPublicKey(this.userId, {
      status: PublicKeyStatus.PENDING,
      type: PublicKeyType.WEB,
    });

    return this.getWebAuthURLForCreate(res.data.id, res.data.partnerId, isForNewDevice);
  }

  // TODO: consider changing this to just hit a new endpoint that returns
  //   true/false if session is active
  async isSessionActive(): Promise<boolean> {
    const res = await this.ctx.capsuleClient.touchSession();
    return (
      res.data.biometricVerifiedAt &&
      biometricVerifiedRecently(this.ctx, res.data.biometricVerifiedAt)
    );
  }

  /**
   * Checks if a session is active and a wallet exists.
   *
   * @returns - true if session is active and a wallet exists.
   **/
  async isFullyLoggedIn(): Promise<boolean> {
    const isSessionActive = await this.isSessionActive();
    const walletAddress = this.getWallets()?.[Object.keys(this.getWallets())[0]]?.address;

    return isSessionActive && !!walletAddress;
  }

  /**
   * Initiates a login.
   * @param email - the email to login with
   * @param useShortURL - whether to shorten the link
   * @returns - web auth url for logging in
   **/
  async initiateUserLogin(email: string, useShortURL?: boolean): Promise<string> {
    await this.setEmail(email);
    const res = await this.ctx.capsuleClient.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      const keyPair = await getAsymmetricKeyPair(this.ctx);
      await this.setLoginEncryptionKeyPair(keyPair);
    }

    const webAuthLoginURL = await this.getWebAuthURLForLogin(
      res.data.sessionId,
      getPublicKeyHex(this.loginEncryptionKeyPair),
      res.data.partnerId,
    );
    if (!useShortURL) {
      return webAuthLoginURL;
    }

    return this.shortenLoginLink(webAuthLoginURL);
  }

  /**
   * Waits for the session to be active.
   **/
  async waitForAccountCreation(): Promise<void> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));

        if (await this.isSessionActive()) {
          return;
        }
      } catch (err) {
        // want to continue polling on error
        console.error(err);
      }
    }
  }

  async getGoogleOAuthURL(): Promise<string> {
    const res = await this.ctx.capsuleClient.touchSession(true);
    return `${getBaseUrl(this.ctx.env)}auth/google?sessionLookupId=${encodeURIComponent(res.data.sessionLookupId)}`;
  }

  async waitForGoogleOAuth(): Promise<{
    email: string,
    userExists: boolean,
  }> {
    while (true) {
      try {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));

        const res = await this.ctx.capsuleClient.touchSession();
        if (res.data.userId) {
          const { userId, email } = res.data;
          await this.setUserId(userId);
          await this.setEmail(email);
          const userExists = await this.checkIfUserExists(email);
          return {
            userExists,
            email,
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  /**
   * Waits for the session to be active and sets up the user.
   * @returns { needsWallet } - whether a wallet needs to be created
   **/
  async waitForLoginAndSetup(skipSessionRefresh?: boolean): Promise<{ needsWallet: boolean }> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
        if (!(await this.isSessionActive())) {
          continue;
        }
        await this.userSetupAfterLogin();

        const fetchedWallets = (await this.fetchWallets()).filter(
          wallet => !!wallet.address,
        );
        const tempSharesRes = await this.getTransmissionKeyShares();
        // need this check for the case where user has logged in but temp encrypted shares
        // haven't been sent to the backend yet
        if (
          tempSharesRes.data.temporaryShares.length === fetchedWallets.length
        ) {
          await this.setupAfterLogin(tempSharesRes.data.temporaryShares, skipSessionRefresh);
          return { needsWallet: Object.values(this.getWallets()).length === 0 };
        }
      } catch (err) {
        // want to continue polling on error
        console.error(err);
      }
    }
  }

  /**
   * Updates the session with the user management server, possibly
   * opening a popup to refresh the session.
   *
   * @param shouldOpenPopup - true if you want to open the popup automatically
   * @returns - web auth url for refreshing session
   **/
  async refreshSession(shouldOpenPopup: boolean): Promise<string> {
    const res = await this.ctx.capsuleClient.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      const keyPair = await getAsymmetricKeyPair(this.ctx);
      await this.setLoginEncryptionKeyPair(keyPair);
    }

    const link = await this.getWebAuthURLForLogin(
      res.data.sessionId,
      getPublicKeyHex(this.loginEncryptionKeyPair),
    );

    if (shouldOpenPopup) {
      this.platformUtils.openPopup(link);
    }

    return link;
  }

  /**
   * Call this method after login to ensure that the user ID is set
   * internally.
   **/
  async userSetupAfterLogin(): Promise<void> {
    const res = await this.ctx.capsuleClient.touchSession();
    await this.setUserId(res.data.userId);
  }

  /**
   * Get transmission shares associated with session.
   *
   * @param isForNewDevice - true if this device is registering.
   * @returns - transmission keyshares.
   **/
  async getTransmissionKeyShares(isForNewDevice?: boolean): Promise<any> {
    const res = await this.ctx.capsuleClient.touchSession();
    const sessionLookupId = isForNewDevice ?
      `${res.data.sessionLookupId}-new-device` :
      res.data.sessionLookupId;
    return this.ctx.capsuleClient.getTransmissionKeyshares(this.userId, sessionLookupId);
  }

  /**
   * Call this method after login to perform setup.
   *
   * @param temporaryShares - optional temporary shares to use for decryption.
   **/
  async setupAfterLogin(temporaryShares?: any[], skipSessionRefresh?: boolean): Promise<void> {
    if (!temporaryShares) {
      temporaryShares = (await this.getTransmissionKeyShares()).data.temporaryShares;
    }

    temporaryShares.forEach((share) => {
      this.wallets[share.walletId] = {
        id: share.walletId,
        signer: decryptWithKeyPair(
          this.loginEncryptionKeyPair,
          share.encryptedShare,
          share.encryptedKey,
        ),
      };
    });

    await this.deleteLoginEncryptionKeyPair();
    await this.populateWalletAddresses();
    await this.ctx.capsuleClient.touchSession(!skipSessionRefresh);
  }

  /**
   * Distributes a new wallet recovery share.
   *
   * @param walletId - the wallet to distribute the recovery share for.
   * @param userShare - the user share generate the recovery share from.
   * @returns - recovery share.
   **/
  async distributeNewWalletShare(
    walletId: string,
    userShare: string,
  ): Promise<string> {
    const recoveryShare = await distributeNewShare(
      this.ctx,
      this.userId,
      walletId,
      userShare,
    );
    return recoveryShare;
  }

  private async waitForWalletAddress(walletId: string): Promise<void> {
    let maxPolls = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        if (maxPolls === 10) {
          break;
        }
        ++maxPolls;
        const res = await this.ctx.capsuleClient.getWallets(this.userId);
        const wallet = res.data.wallets.find((w) => w.id === walletId);
        if (wallet && wallet.address) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, SHORT_POLLING_INTERVAL_MS));
      } catch (err) {
        // want to continue polling on error
        console.error(err);
      }
    }
    throw new Error('timed out waiting for wallet address');
  }

  /**
   * Creates a new wallet.
   *
   * @param skipDistribute - if true, recovery share will not be distributed.
   * @param [customFunction] - {deprecated} method called when createWallet is done.
   * @returns [wallet, recoveryShare]
   **/
  async createWallet(
    skipDistribute = false,
    customFunction?: (params?: any) => void,
  ): Promise<[Wallet, string | null]> {
    this.requireApiKey();
    const { signer, walletId } = await this.platformUtils.keygen(
      this.ctx,
      this.userId,
      null,
      this.retrieveSessionCookie(),
    );
    this.wallets[walletId] = {
      id: walletId,
      signer,
    };
    await this.waitForWalletAddress(walletId);
    await this.populateWalletAddresses();

    let recoveryShare: string | null = null;
    if (!skipDistribute) {
      recoveryShare = await distributeNewShare(
        this.ctx,
        this.userId,
        walletId,
        signer,
      );
    }

    await this.setWallets(this.wallets);
    return [this.wallets[walletId], recoveryShare];
  }

  private getTransactionReviewUrl(transactionId: string): string {
    return `${getPortalBaseURL(this.ctx)}/web/users/${
      this.userId
    }/transaction-review/${transactionId}?email=${encodeURIComponent(
      this.email,
    )}`;
  }

  /**
   * Signs a message.
   *
   * If you want to sign the keccak256 hash of a message, hash the
   * message first and then pass in the base64 encoded hash.
   * @param walletId - id of the wallet to sign with.
   * @param messageBase64 - base64 encoding of exact message that should be signed
   **/
  async signMessage(
    walletId: string,
    messageBase64: string,
  ): Promise<FullSignatureRes> {
    const wallet = this.wallets[walletId];
    const res = await this.platformUtils.signMessage(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      messageBase64,
      this.retrieveSessionCookie(),
      wallet.scheme === WalletScheme.DKLS,
    );
    if ((res as DeniedSignatureRes).pendingTransactionId) {
      return {
        ...res,
        transactionReviewUrl: this.getTransactionReviewUrl(
          (res as DeniedSignatureRes).pendingTransactionId,
        ),
      };
    }

    return res as SuccessfulSignatureRes;
  }

  /**
   * Signs a transaction.
   * @param walletId - id of the wallet to sign the transaction from.
   * @param rlpEncodedTxBase64 - rlp encoded tx as base64 string
   * @param chainId - chain id of the chain the transaction is being sent on.
   **/
  async signTransaction(
    walletId: string,
    rlpEncodedTxBase64: string,
    chainId: string,
  ): Promise<FullSignatureRes> {
    const wallet = this.wallets[walletId];
    const res = await this.platformUtils.signTransaction(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      rlpEncodedTxBase64,
      chainId,
      this.retrieveSessionCookie(),
      wallet.scheme === WalletScheme.DKLS,
    );
    if ((res as DeniedSignatureRes).pendingTransactionId) {
      return {
        ...res,
        transactionReviewUrl: this.getTransactionReviewUrl(
          (res as DeniedSignatureRes).pendingTransactionId,
        ),
      };
    }

    return res as SuccessfulSignatureRes;
  }

  /**
   * Sends a transaction.
   * @param walletId - id of the wallet to send the transaction from.
   * @param rlpEncodedTxBase64 - rlp encoded tx as base64 string
   * @param chainId - chain id of the chain the transaction is being sent on.
   **/
  async sendTransaction(
    walletId: string,
    rlpEncodedTxBase64: string,
    chainId: string,
  ): Promise<FullSignatureRes> {
    const wallet = this.wallets[walletId];
    const res = await this.platformUtils.sendTransaction(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      rlpEncodedTxBase64,
      chainId,
      this.retrieveSessionCookie(),
      wallet.scheme === WalletScheme.DKLS,
    );
    if ((res as DeniedSignatureRes).pendingTransactionId) {
      return {
        ...res,
        transactionReviewUrl: this.getTransactionReviewUrl(
          (res as DeniedSignatureRes).pendingTransactionId,
        ),
      };
    }

    return res as SuccessfulSignatureRes;
  }

  isProviderModalDisabled(): boolean {
    return !!this.disableProviderModal;
  }

  exportSession(): string {
    const sessionInfo = {
      email: this.email,
      userId: this.userId,
      wallets: this.wallets,
      sessionCookie: this.sessionCookie,
    };
    return Buffer.from(JSON.stringify(sessionInfo)).toString('base64');
  }

  async importSession(serializedInstanceBase64: string): Promise<void> {
    const serializedInstance = Buffer.from(
      serializedInstanceBase64,
      'base64',
    ).toString('utf8');
    const sessionInfo = JSON.parse(serializedInstance);
    await this.setEmail(sessionInfo.email);
    await this.setUserId(sessionInfo.userId);
    await this.setWallets(sessionInfo.wallets);
    this.persistSessionCookie(sessionInfo.sessionCookie);
  }

  /**
   * Logs the user out.
   **/
  async logout(): Promise<void> {
    await this.ctx.capsuleClient.logout();
    await this.clearStorage();
    this.wallets = {};
    this.loginEncryptionKeyPair = undefined;
    this.email = undefined;
    this.userId = undefined;
    this.sessionCookie = undefined;
  }

  /**
   * Converts to a string, removing sensitive data when logging this class.
   *
   * Doesn't work for all types of logging.
   **/
  toString(): string {
    const redactedWallets = Object.keys(this.wallets).reduce(
      (acc, walletId) => ({
        ...acc,
        [walletId]: {
          id: walletId,
          address: this.wallets[walletId].address,
          signer: this.wallets[walletId].signer ? '[REDACTED]' : undefined,
        },
      }),
      {},
    );
    const obj = {
      email: this.email,
      userId: this.userId,
      wallets: redactedWallets,
      loginEncryptionKeyPair: this.loginEncryptionKeyPair
        ? '[REDACTED]'
        : undefined,
    };

    return `Capsule ${JSON.stringify(obj)}`;
  }
}
