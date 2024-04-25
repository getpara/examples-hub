import {
  BackupKitEmailProps,
  EmailTheme,
  PublicKeyStatus,
  PublicKeyType,
  VerificationEmailProps,
} from '@usecapsule/user-management-client';
import { pki, jsbn } from 'node-forge';

import { decryptWithKeyPair, getAsymmetricKeyPair, getPublicKeyHex } from './cryptography/utils.js';
import { Ctx, getPortalBaseURL } from './definitions.js';
import { Environment, OAuthMethod } from './definitions.js';
import { getBaseUrl, initClient } from './external/capsuleClient.js';
import * as mpcComputationClient from './external/mpcComputationClient.js';
import { distributeNewShare } from './shares/shareDistribution.js';
import { FullSignatureRes, SuccessfulSignatureRes, DeniedSignatureRes } from './types/walletTypes.js';
import * as transmissionUtils from './transmission/transmissionUtils.js';
import { PlatformUtils } from './PlatformUtils.js';
import { Theme } from './types/theme.js';
import { sendRecoveryForShare } from './shares/recovery.js';

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
  userId?: string;
  partnerId?: string;
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
  portalTheme?: Theme;
  useDKLSForCreation?: boolean;
  disableWebSockets?: boolean;
  wasmOverride?: ArrayBuffer;
  emailTheme?: EmailTheme;
  emailPrimaryColor?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  xUrl?: string;
  supportUrl?: string;
  homepageUrl?: string;
}

export const PREFIX = '@CAPSULE/';
const LOCAL_STORAGE_EMAIL = `${PREFIX}e-mail`;
const LOCAL_STORAGE_USER_ID = `${PREFIX}userId`;
const LOCAL_STORAGE_WALLETS = `${PREFIX}wallets`;
const LOCAL_STORAGE_SESSION_COOKIE = `${PREFIX}sessionCookie`;
const SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR = `${PREFIX}loginEncryptionKeyPair`;
const POLLING_INTERVAL_MS = 2000;
const SHORT_POLLING_INTERVAL_MS = 1000;

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
   * Base theme for the emails sent from this Capsule instance.
   * @default - dark
   */
  emailTheme?: EmailTheme;

  /**
   * Hex color to use as the primary color in the emails.
   * @default - #FE452B
   */
  emailPrimaryColor?: string;

  /**
   * Linkedin URL to link to in the emails. Should be a secure URL string starting with https://www.linkedin.com/company/.
   */
  linkedinUrl?: string;

  /**
   * Github URL to link to in the emails. Should be a secure URL string starting with https://github.com/.
   */
  githubUrl?: string;

  /**
   * X (Twitter) URL to link to in the emails. Should be a secure URL string starting with https://twitter.com/.
   */
  xUrl?: string;

  /**
   * Support URL to link to in the emails. This can be a secure https URL or a mailto: string. Will default to using the stored application URL is nothing is provided here.
   */
  supportUrl?: string;

  /**
   * URL for your home landing page. Should be a secure URL string starting with https://.
   */
  homepageUrl?: string;

  /**
   * Encryption key pair generated from loginEncryptionKey.
   */
  loginEncryptionKeyPair?: pki.rsa.KeyPair;

  /**
   * Hex color to use in the portal for the background color.
   * @deprecated use portalTheme instead
   */
  portalBackgroundColor?: string;

  /**
   * Hex color to use in the portal for the primary button.
   * @deprecated use portalTheme instead
   */
  portalPrimaryButtonColor?: string;

  /**
   * Hex text color to use in the portal.
   * @deprecated use portalTheme instead
   */
  portalTextColor?: string;

  /**
   * Hex color to use in the portal for the primary button text.
   * @deprecated use portalTheme instead
   */
  portalPrimaryButtonTextColor?: string;

  /**
   * Theme to use for the portal
   */
  portalTheme?: Theme;

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
  };

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
        must provide an API key to the capsule instance`,
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

    this.emailPrimaryColor = opts.emailPrimaryColor;
    this.emailTheme = opts.emailTheme;
    this.homepageUrl = opts.homepageUrl;
    this.supportUrl = opts.supportUrl;
    this.xUrl = opts.xUrl;
    this.githubUrl = opts.githubUrl;
    this.linkedinUrl = opts.linkedinUrl;

    this.portalBackgroundColor = opts.portalBackgroundColor;
    this.portalPrimaryButtonColor = opts.portalPrimaryButtonColor;
    this.portalTextColor = opts.portalTextColor;
    this.portalPrimaryButtonTextColor = opts.portalPrimaryButtonTextColor;
    this.portalTheme = opts.portalTheme;

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

    this.email = (this.localStorageGetItem(LOCAL_STORAGE_EMAIL) as string) || undefined;
    this.userId = (this.localStorageGetItem(LOCAL_STORAGE_USER_ID) as string) || undefined;
    // TODO: remove sessionStorageGetItem call once new version is being consumed
    this.sessionCookie =
      (this.localStorageGetItem(LOCAL_STORAGE_SESSION_COOKIE) as string) ||
      (this.sessionStorageGetItem(LOCAL_STORAGE_SESSION_COOKIE) as string) ||
      undefined;

    const stringWallets = this.platformUtils.secureStorage
      ? this.platformUtils.secureStorage.get(LOCAL_STORAGE_WALLETS)
      : this.localStorageGetItem(LOCAL_STORAGE_WALLETS);
    this.wallets = JSON.parse((stringWallets as string) || '{}');

    const loginEncryptionKey = this.sessionStorageGetItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR) as string | null;
    if (loginEncryptionKey && loginEncryptionKey !== 'undefined') {
      this.loginEncryptionKeyPair = this.convertEncryptionKeyPair(JSON.parse(loginEncryptionKey));
    }
  }

  private getVerificationEmailProps(): VerificationEmailProps {
    return {
      brandColor: this.emailPrimaryColor,
      theme: this.emailTheme,
      supportUrl: this.supportUrl,
      homepageUrl: this.homepageUrl,
      xUrl: this.xUrl,
      githubUrl: this.githubUrl,
      linkedinUrl: this.linkedinUrl,
    };
  }

  private getBackupKitEmailProps(): BackupKitEmailProps {
    return {
      brandColor: this.emailPrimaryColor,
      theme: this.emailTheme,
      homepageUrl: this.homepageUrl,
      xUrl: this.xUrl,
      linkedinUrl: this.linkedinUrl,
      githubUrl: this.githubUrl,
      supportUrl: this.supportUrl,
    };
  }

  /**
   * Initialize storage relating to a `CoreCapsule` instance.
   *
   * Init only needs to be called for storage that is async.
   */
  async init(): Promise<void> {
    this.email = (await this.localStorageGetItem(LOCAL_STORAGE_EMAIL)) || undefined;
    this.userId = (await this.localStorageGetItem(LOCAL_STORAGE_USER_ID)) || undefined;
    // TODO: remove sessionStorageGetItem call once new version is being consumed
    this.sessionCookie =
      (await this.localStorageGetItem(LOCAL_STORAGE_SESSION_COOKIE)) ||
      (await this.sessionStorageGetItem(LOCAL_STORAGE_SESSION_COOKIE)) ||
      undefined;

    const stringWallets = this.platformUtils.secureStorage
      ? await this.platformUtils.secureStorage.get(LOCAL_STORAGE_WALLETS)
      : await this.localStorageGetItem(LOCAL_STORAGE_WALLETS);
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
    await this.sessionStorageSetItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR, JSON.stringify(keyPair));
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

  getAddress(walletId?: string): string | undefined {
    return walletId ? this.wallets[walletId].address : Object.values(this.wallets)?.[0]?.address;
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
    return (partnerId && (await this.getPartnerURL(partnerId))) || getPortalBaseURL(this.ctx);
  }

  private async getWebAuthURLForCreate(webAuthId: string, partnerId?: string, isForNewDevice?: boolean): Promise<string> {
    const partnerIdQueryParam = partnerId ? `&partnerId=${partnerId}` : '';
    const portalBorderRadiusQueryParam = this.portalTheme?.borderRadius
      ? `&portalBorderRadius=${encodeURIComponent(this.portalTheme.borderRadius)}`
      : '';
    const portalForegroundColorQueryParam = this.portalTheme?.foregroundColor
      ? `&portalForegroundColor=${encodeURIComponent(this.portalTheme.foregroundColor)}`
      : '';
    const portalBackgroundColorQueryParam =
      this.portalBackgroundColor || this.portalTheme?.backgroundColor
        ? `&portalBackgroundColor=${encodeURIComponent(this.portalBackgroundColor ?? this.portalTheme.backgroundColor)}`
        : '';
    const portalPrimaryButtonColorQueryParam = this.portalPrimaryButtonColor
      ? `&portalPrimaryButtonColor=${encodeURIComponent(this.portalPrimaryButtonColor)}`
      : '';
    const portalTextColorQueryParam = this.portalTextColor
      ? `&portalTextColor=${encodeURIComponent(this.portalTextColor)}`
      : '';
    const portalPrimaryButtonTextColorQueryParam = this.portalPrimaryButtonTextColor
      ? `&portalPrimaryButtonTextColor=${encodeURIComponent(this.portalPrimaryButtonTextColor)}`
      : '';
    const isForNewDeviceQueryParam = isForNewDevice ? `&isForNewDevice=${isForNewDevice}` : '';

    return `${(partnerId && (await this.getPartnerURL(partnerId))) || getPortalBaseURL(this.ctx)}/web/users/${
      this.userId
    }/biometrics/${webAuthId}?email=${encodeURIComponent(
      this.email,
    )}${partnerIdQueryParam}${portalBorderRadiusQueryParam}${portalForegroundColorQueryParam}${portalBackgroundColorQueryParam}${portalPrimaryButtonColorQueryParam}${portalTextColorQueryParam}${isForNewDeviceQueryParam}${portalPrimaryButtonTextColorQueryParam}`;
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
    const portalBorderRadiusQueryParam = this.portalTheme?.borderRadius
      ? `&portalBorderRadius=${encodeURIComponent(this.portalTheme.borderRadius)}`
      : '';
    const portalForegroundColorQueryParam = this.portalTheme?.foregroundColor
      ? `&portalForegroundColor=${encodeURIComponent(this.portalTheme.foregroundColor)}`
      : '';
    const portalBackgroundColorQueryParam =
      this.portalBackgroundColor || this.portalTheme?.backgroundColor
        ? `&portalBackgroundColor=${encodeURIComponent(this.portalBackgroundColor ?? this.portalTheme.backgroundColor)}`
        : '';
    const portalPrimaryButtonColorQueryParam = this.portalPrimaryButtonColor
      ? `&portalPrimaryButtonColor=${encodeURIComponent(this.portalPrimaryButtonColor)}`
      : '';
    const portalTextColorQueryParam = this.portalTextColor
      ? `&portalTextColor=${encodeURIComponent(this.portalTextColor)}`
      : '';
    const portalPrimaryButtonTextColorQueryParam = this.portalPrimaryButtonTextColor
      ? `&portalPrimaryButtonTextColor=${encodeURIComponent(this.portalPrimaryButtonTextColor)}`
      : '';
    const newDeviceSessionIdQueryParam = newDeviceSessionId ? `&newDeviceSessionId=${newDeviceSessionId}` : '';
    const newDeviceEncryptionKeyQueryParam = newDeviceEncryptionKey
      ? `&newDeviceEncryptionKey=${newDeviceEncryptionKey}`
      : '';

    return `${(partnerId && (await this.getPartnerURL(partnerId))) || getPortalBaseURL(this.ctx)}/web/biometrics/login?email=${encodeURIComponent(
      this.email,
    )}&sessionId=${sessionId}&encryptionKey=${loginEncryptionPublicKey}${partnerIdQueryParam}${portalBackgroundColorQueryParam}${portalPrimaryButtonColorQueryParam}${portalTextColorQueryParam}${newDeviceSessionIdQueryParam}${portalBorderRadiusQueryParam}${portalForegroundColorQueryParam}${newDeviceEncryptionKeyQueryParam}${portalPrimaryButtonTextColorQueryParam}`;
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
    wallets.forEach(
      (wallet: {
        id: string;
        address?: string;
        publicKey?: string;
        scheme?: WalletScheme;
        partnerId?: string;
        userId?: string;
      }) => {
        if (this.wallets[wallet.id]) {
          this.wallets[wallet.id].address = wallet.address;
          this.wallets[wallet.id].publicKey = wallet.publicKey;
          this.wallets[wallet.id].scheme = wallet.scheme;
          this.wallets[wallet.id].partnerId = wallet.partnerId;
          this.wallets[wallet.id].userId = wallet.userId;
        }
      },
    );
    await this.setWallets(this.wallets);
  }

  private async populatePregenWalletAddresses(email: string): Promise<void> {
    const res = await this.ctx.capsuleClient.getPregenWallets(email);
    const wallets = res.wallets;
    wallets.forEach(
      (wallet: {
        id: string;
        address?: string;
        publicKey?: string;
        scheme?: WalletScheme | string;
        partnerId?: string;
        userId?: string;
      }) => {
        if (this.wallets[wallet.id]) {
          this.wallets[wallet.id].address = wallet.address;
          this.wallets[wallet.id].publicKey = wallet.publicKey;
          this.wallets[wallet.id].scheme = wallet.scheme as WalletScheme;
          this.wallets[wallet.id].partnerId = wallet.partnerId;
          this.wallets[wallet.id].userId = wallet.userId;
        }
      },
    );
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
    await this.setWallets({});
    const { userId } = await this.ctx.capsuleClient.createUser({
      email: this.email,
      ...this.getVerificationEmailProps(),
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
  async verify2FA(
    email: string,
    verificationCode: string,
  ): Promise<{
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
    };
  }

  /**
   * Sets up 2FA.
   * @returns uri - uri to use for setting up 2FA
   * */
  async setup2FA(): Promise<{
    uri?: string;
  }> {
    const res = await this.ctx.capsuleClient.setup2FA(this.userId);
    return {
      uri: res.data.uri,
    };
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
    isSetup: boolean;
  }> {
    if (!this.userId) {
      return { isSetup: false };
    }
    const res = await this.ctx.capsuleClient.check2FAStatus(this.userId);
    return {
      isSetup: res.data.isSetup,
    };
  }

  async resendVerificationCode(): Promise<void> {
    await this.ctx.capsuleClient.resendVerificationCode({
      userId: this.userId,
      ...this.getVerificationEmailProps(),
    });
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
    return res.data.biometricVerifiedAt && biometricVerifiedRecently(this.ctx, res.data.biometricVerifiedAt);
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
    while (true) {
      try {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));

        if (await this.isSessionActive()) {
          return;
        }
      } catch (err) {
        // want to continue polling on error
        console.error(err);
      }
    }
  }

  async waitForPasskeyAndCreateWallet(): Promise<string> {
    await this.waitForAccountCreation();
    // This function gets pregen wallets by email and partnerId
    const res = await this.ctx.capsuleClient.getPregenWallets(this.email);
    const wallet = res.wallets[0];

    if (wallet) {
      const [, recovery] = await this.claimPregenWallet(this.email);
      return recovery;
    } else {
      const [, recovery] = await this.createWallet();
      return recovery;
    }
  }

  async getOAuthURL(oAuthMethod: OAuthMethod): Promise<string> {
    await this.logout();
    const res = await this.ctx.capsuleClient.touchSession(true);
    return `${getBaseUrl(this.ctx.env)}auth/${oAuthMethod.toLowerCase()}?sessionLookupId=${encodeURIComponent(res.data.sessionLookupId)}`;
  }

  async waitForOAuth(): Promise<{
    email: string;
    userExists: boolean;
  }> {
    while (true) {
      try {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));

        const res = await this.ctx.capsuleClient.touchSession();
        if (res.data.userId) {
          const { userId, email } = res.data;
          await this.setUserId(userId);
          await this.setEmail(email);
          const userExists = await this.checkIfUserExists(email);
          return {
            userExists,
            email,
          };
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
    while (true) {
      try {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));
        if (!(await this.isSessionActive())) {
          continue;
        }
        await this.userSetupAfterLogin();

        const fetchedWallets = (await this.fetchWallets()).filter((wallet) => !!wallet.address);
        const tempSharesRes = await this.getTransmissionKeyShares();
        // need this check for the case where user has logged in but temp encrypted shares
        // haven't been sent to the backend yet
        if (tempSharesRes.data.temporaryShares.length === fetchedWallets.length) {
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

    const link = await this.getWebAuthURLForLogin(res.data.sessionId, getPublicKeyHex(this.loginEncryptionKeyPair));

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
    const sessionLookupId = isForNewDevice ? `${res.data.sessionLookupId}-new-device` : res.data.sessionLookupId;
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

    await this.setWallets({});
    temporaryShares.forEach((share) => {
      this.wallets[share.walletId] = {
        id: share.walletId,
        signer: decryptWithKeyPair(this.loginEncryptionKeyPair, share.encryptedShare, share.encryptedKey),
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
   * @param userShare - optional user share generate the recovery share from. Defaults to the signer from the passed in walletId
   * @param skipBiometricShareCreation - whether or not to skip biometric share creation. Used when regenerating recovery shares.
   * @returns - recovery share.
   **/
  async distributeNewWalletShare(
    walletId: string,
    userShare?: string,
    skipBiometricShareCreation?: boolean,
  ): Promise<string> {
    let _userShare = userShare;

    if (!_userShare) {
      _userShare = this.wallets[walletId].signer;
    }

    const recoveryShare = skipBiometricShareCreation
      ? await sendRecoveryForShare(this.ctx, this.userId, walletId, [], _userShare, false, this.getBackupKitEmailProps())
      : await distributeNewShare(this.ctx, this.userId, walletId, _userShare, false, this.getBackupKitEmailProps());
    return recoveryShare;
  }

  private async waitForWalletAddress(walletId: string): Promise<void> {
    let maxPolls = 0;

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
        await new Promise((resolve) => setTimeout(resolve, SHORT_POLLING_INTERVAL_MS));
      } catch (err) {
        // want to continue polling on error
        console.error(err);
      }
    }
    throw new Error('timed out waiting for wallet address');
  }

  /**
   * Waits for a pregen wallet address to be created.
   *
   * @param email - the email of the user the pregen wallet is associated with.
   * @param walletId - the wallet id
   * @returns - recovery share.
   **/
  private async waitForPregenWalletAddress(email: string, walletId: string): Promise<void> {
    let maxPolls = 0;

    while (true) {
      try {
        if (maxPolls === 10) {
          break;
        }
        ++maxPolls;
        const res = await this.ctx.capsuleClient.getPregenWallets(email);

        const wallet = res.wallets.find((w) => w.id === walletId);
        if (wallet && wallet.address) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, SHORT_POLLING_INTERVAL_MS));
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
  async createWallet(skipDistribute = false, _customFunction?: (params?: any) => void): Promise<[Wallet, string | null]> {
    this.requireApiKey();
    const { signer, walletId } = await this.platformUtils.keygen(
      this.ctx,
      this.userId,
      null,
      this.retrieveSessionCookie(),
      this.getBackupKitEmailProps(),
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
        false,
        this.getBackupKitEmailProps(),
      );
    }

    await this.setWallets(this.wallets);
    return [this.wallets[walletId], recoveryShare];
  }

  /**
   * Creates a new pregenerated wallet.
   *
   * @param email - string
   * @returns [wallet, recoveryShare]
   **/
  async createWalletPreGen(email: string): Promise<Wallet> {
    this.requireApiKey();
    const { signer, walletId } = await this.platformUtils.preKeygen(
      this.ctx,
      undefined,
      email,
      null,
      this.retrieveSessionCookie(),
    );
    this.wallets[walletId] = {
      id: walletId,
      signer,
    };

    await this.waitForPregenWalletAddress(email, walletId);
    await this.populatePregenWalletAddresses(email);

    return this.wallets[walletId];
  }

  /**
   * Claims a pregenerated wallet.
   *
   * @param email string the email of the user claiming the wallet
   * @returns [wallet, recoveryShare]
   **/
  async claimPregenWallet(email: string): Promise<[Wallet, string]> {
    this.requireApiKey();
    const userExist = await this.checkIfUserExists(email);
    if (!userExist) {
      throw new Error('user does not exist');
    }

    // This function gets pregen wallets by email and partnerId
    const res = await this.ctx.capsuleClient.getPregenWallets(email);
    const wallet = res.wallets[0];
    if (!wallet) {
      throw new Error('wallet not found');
    }

    await this.ctx.capsuleClient.claimPregenWallet({ userId: this.userId, walletId: wallet.id });

    const recoveryShare = await distributeNewShare(
      this.ctx,
      this.userId,
      wallet.id,
      this.wallets[wallet.id].signer,
      false,
      this.getBackupKitEmailProps(),
    );

    return [this.wallets[wallet.id], recoveryShare];
  }

  /**
   * Updates a pregenerated wallet email.
   *
   * @param newEmail - string
   * @param walletId - string
   * @returns Promise<void>
   **/
  async updateWalletEmailPreGen(newEmail: string, walletId?: string): Promise<void> {
    this.requireApiKey();
    const currentWalletId = walletId || Object.keys(this.wallets)[0];
    await this.ctx.capsuleClient.updatePregenWallet(currentWalletId, { email: newEmail });
  }

  /**
   * Checks if Pregen Wallet exists for the email and partnerId
   *
   * @param email string the email of the user claiming the wallet
   * @returns Promise<boolean>
   **/
  async hasPregenWallet(email: string): Promise<boolean> {
    this.requireApiKey();

    // This function gets pregen wallets by email and partnerId
    const res = await this.ctx.capsuleClient.getPregenWallets(email);
    const wallet = res.wallets[0];
    if (!wallet) {
      return false;
    }
    return true;
  }

  /**
   * Returns a base64 encoded wallet
   *
   * @returns string base64 encoded wallet
   **/
  getUserShare(): string | null {
    const wallet = Object.values(this.wallets)[0];

    if (wallet) {
      const walletJson = JSON.stringify(wallet);
      const base64Wallet = Buffer.from(walletJson).toString('base64');
      return base64Wallet;
    } else {
      return null;
    }
  }

  /**
   * Sets a wallet from a base 64 encoded wallet
   *
   * @param base64Wallet
   * @returns Promise<void>
   **/
  async setUserShare(base64Wallet: string): Promise<void> {
    const walletJson = Buffer.from(base64Wallet, 'base64').toString();
    const wallet = JSON.parse(walletJson) as Wallet;
    this.wallets[wallet.id] = wallet;
    await this.setWallets(this.wallets);
  }

  private getTransactionReviewUrl(transactionId: string): string {
    return `${getPortalBaseURL(this.ctx)}/web/users/${
      this.userId
    }/transaction-review/${transactionId}?email=${encodeURIComponent(this.email)}`;
  }

  /**
   * Signs a message.
   *
   * If you want to sign the keccak256 hash of a message, hash the
   * message first and then pass in the base64 encoded hash.
   * @param walletId - id of the wallet to sign with.
   * @param messageBase64 - base64 encoding of exact message that should be signed
   **/
  async signMessage(walletId: string, messageBase64: string): Promise<FullSignatureRes> {
    const wallet = this.wallets[walletId];
    let signerId: string = this.userId;
    if (wallet.partnerId && !wallet.userId) {
      signerId = wallet.partnerId;
    }
    const res = await this.platformUtils.signMessage(
      this.ctx,
      signerId,
      walletId,
      this.wallets[walletId].signer,
      messageBase64,
      this.retrieveSessionCookie(),
      wallet.scheme === WalletScheme.DKLS,
    );
    if ((res as DeniedSignatureRes).pendingTransactionId) {
      return {
        ...res,
        transactionReviewUrl: this.getTransactionReviewUrl((res as DeniedSignatureRes).pendingTransactionId),
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
  async signTransaction(walletId: string, rlpEncodedTxBase64: string, chainId: string): Promise<FullSignatureRes> {
    const wallet = this.wallets[walletId];
    let signerId: string = this.userId;
    if (wallet.partnerId && !wallet.userId) {
      signerId = wallet.partnerId;
    }
    const res = await this.platformUtils.signTransaction(
      this.ctx,
      signerId,
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
        transactionReviewUrl: this.getTransactionReviewUrl((res as DeniedSignatureRes).pendingTransactionId),
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
  async sendTransaction(walletId: string, rlpEncodedTxBase64: string, chainId: string): Promise<FullSignatureRes> {
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
        transactionReviewUrl: this.getTransactionReviewUrl((res as DeniedSignatureRes).pendingTransactionId),
      };
    }

    return res as SuccessfulSignatureRes;
  }

  isProviderModalDisabled(): boolean {
    return !!this.disableProviderModal;
  }

  /**
   * Returns true if session was successfully kept alive, false otherwise.
   **/
  async keepSessionAlive(): Promise<boolean> {
    try {
      await this.ctx.capsuleClient.keepSessionAlive(this.userId!);
      return true;
    } catch (err) {
      return false;
    }
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
    const serializedInstance = Buffer.from(serializedInstanceBase64, 'base64').toString('utf8');
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
      loginEncryptionKeyPair: this.loginEncryptionKeyPair ? '[REDACTED]' : undefined,
    };

    return `Capsule ${JSON.stringify(obj)}`;
  }
}
