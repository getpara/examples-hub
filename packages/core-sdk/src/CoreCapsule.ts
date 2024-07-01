import {
  BackupKitEmailProps,
  EmailTheme,
  OnRampPurchase,
  PublicKeyStatus,
  PublicKeyType,
  VerificationEmailProps,
  WalletEntity,
} from '@usecapsule/user-management-client';
import { pki, jsbn } from 'node-forge';

import { decryptWithPrivateKey, getAsymmetricKeyPair, getPublicKeyHex } from './cryptography/utils.js';
import { Ctx, OnRampAssetProp, OnRampProviderProp, getAsset, getPortalBaseURL, getProvider } from './definitions.js';
import { Environment, OAuthMethod } from './definitions.js';
import { getBaseUrl, initClient } from './external/capsuleClient.js';
import * as mpcComputationClient from './external/mpcComputationClient.js';
import { distributeNewShare } from './shares/shareDistribution.js';
import { FullSignatureRes, SuccessfulSignatureRes, DeniedSignatureRes } from './types/walletTypes.js';
import * as transmissionUtils from './transmission/transmissionUtils.js';
import { PlatformUtils } from './PlatformUtils.js';
import { Theme } from './types/theme.js';
import { sendRecoveryForShare } from './shares/recovery.js';
import parsePhoneNumberFromString, { CountryCallingCode } from 'libphonenumber-js';

// amount of time in ms that a web auth session lasts
const BIOMETRIC_VERIFICATION_TIME_MS = 30 * 60 * 1000;
const DEV_BIOMETRIC_VERIFICATION_TIME_MS = 60 * 60 * 1000;

enum WalletScheme {
  CGGMP = 'CGGMP',
  DKLS = 'DKLS',
  ED25519 = 'ED25519',
}

export enum WalletType {
  EVM = 'EVM',
  SOLANA = 'SOLANA',
}

// Make sure to keep this in sync with capsule-org/src/entities/recoveryAttemptEntity.ts
export enum RecoveryStatus {
  INITIATED = 'INITIATED',
  READY = 'READY',
  EXPIRED = 'EXPIRED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

// Keep this consistent with user-management code entities/walletEntity.ts
export enum PregenIdentifierType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
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
  supportedWalletTypes?: WalletType[];
}

export const PREFIX = '@CAPSULE/';
const LOCAL_STORAGE_EMAIL = `${PREFIX}e-mail`;
const LOCAL_STORAGE_PHONE = `${PREFIX}phone`;
const LOCAL_STORAGE_COUNTRY_CODE = `${PREFIX}countryCode`;
const LOCAL_STORAGE_FARCASTER_USERNAME = `${PREFIX}farcasterUsername`;
const LOCAL_STORAGE_USER_ID = `${PREFIX}userId`;
const LOCAL_STORAGE_WALLETS = `${PREFIX}wallets`;
const LOCAL_STORAGE_ED25519_WALLETS = `${PREFIX}ed25519Wallets`;
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
  private phone?: string;
  private countryCode?: CountryCallingCode;
  private farcasterUsername?: string;
  private userId?: string;
  private wallets?: Record<string, Wallet>;
  private ed25519Wallets?: Record<string, Wallet>;
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

  private supportedWalletTypes: WalletType[];

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
    this.supportedWalletTypes = opts.supportedWalletTypes || [WalletType.EVM];

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

    const stringED25519Wallets = this.platformUtils.secureStorage
      ? this.platformUtils.secureStorage.get(LOCAL_STORAGE_ED25519_WALLETS)
      : this.localStorageGetItem(LOCAL_STORAGE_ED25519_WALLETS);
    this.ed25519Wallets = JSON.parse((stringED25519Wallets as string) || '{}');

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

    const stringED25519Wallets = this.platformUtils.secureStorage
      ? await this.platformUtils.secureStorage.get(LOCAL_STORAGE_ED25519_WALLETS)
      : await this.localStorageGetItem(LOCAL_STORAGE_ED25519_WALLETS);
    this.ed25519Wallets = JSON.parse(stringED25519Wallets || '{}');

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
   * Sets the phone number associated with the `CoreCapsule` instance.
   * @param phone - Phone number to set.
   * @param countryCode - Country Code to set.
   */
  async setPhoneNumber(phone: string, countryCode: CountryCallingCode): Promise<void> {
    this.phone = phone;
    this.countryCode = countryCode;
    await this.localStorageSetItem(LOCAL_STORAGE_PHONE, phone);
    await this.localStorageSetItem(LOCAL_STORAGE_COUNTRY_CODE, countryCode);
  }

  /**
   * Sets the farcaster username associated with the `CoreCapsule` instance.
   * @param farcasterUsername - Farcaster Username to set.
   */
  async setFarcasterUsername(farcasterUsername: string): Promise<void> {
    this.farcasterUsername = farcasterUsername;
    await this.localStorageSetItem(LOCAL_STORAGE_FARCASTER_USERNAME, farcasterUsername);
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

  async setEd25519Wallets(wallets: Record<string, Wallet>): Promise<void> {
    this.ed25519Wallets = wallets;
    if (this.platformUtils.secureStorage) {
      await this.platformUtils.secureStorage.set(LOCAL_STORAGE_ED25519_WALLETS, JSON.stringify(wallets));
      return;
    }
    await this.localStorageSetItem(LOCAL_STORAGE_ED25519_WALLETS, JSON.stringify(wallets));
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

  getED25519Wallets(): Record<string, Wallet> {
    return this.ed25519Wallets;
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

  private async getCommonLoginQueryParams(newDeviceSessionId?: string, newDeviceEncryptionKey?: string): Promise<string> {
    const newDeviceSessionIdQueryParam = newDeviceSessionId ? `&newDeviceSessionId=${newDeviceSessionId}` : '';
    const newDeviceEncryptionKeyQueryParam = newDeviceEncryptionKey
      ? `&newDeviceEncryptionKey=${newDeviceEncryptionKey}`
      : '';

    return `${newDeviceSessionIdQueryParam}${newDeviceEncryptionKeyQueryParam}`;
  }

  private async getCommonQueryParams(partnerId?: string, isForNewDevice?: boolean): Promise<string> {
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

    return `${partnerIdQueryParam}${portalBorderRadiusQueryParam}${portalForegroundColorQueryParam}${portalBackgroundColorQueryParam}${portalPrimaryButtonColorQueryParam}${portalTextColorQueryParam}${portalPrimaryButtonTextColorQueryParam}${isForNewDeviceQueryParam}`;
  }

  private async getWebAuthURLForCreate(
    type: 'email' | 'phone' | 'farcaster',
    webAuthId: string,
    partnerId?: string,
    isForNewDevice?: boolean,
  ): Promise<string> {
    const commonQueryParams = await this.getCommonQueryParams(partnerId, isForNewDevice);
    const userSpecificParams = {
      email: `email=${encodeURIComponent(this.email)}`,
      phone: `phone=${encodeURIComponent(this.phone)}&countryCode=${encodeURIComponent(this.countryCode)}`,
      farcaster: `farcasterUsername=${encodeURIComponent(this.farcasterUsername)}`,
    }[type];

    return `${(partnerId && (await this.getPartnerURL(partnerId))) || getPortalBaseURL(this.ctx)}/web/users/${this.userId}/biometrics/${webAuthId}?${userSpecificParams}${commonQueryParams}`;
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
    type: 'email' | 'phone' | 'farcaster' = 'email',
  ): Promise<string> {
    const commonQueryParams = await this.getCommonQueryParams(partnerId);
    const commonLoginQueryParams = await this.getCommonLoginQueryParams(newDeviceSessionId, newDeviceEncryptionKey);

    const userSpecificParams = {
      email: `email=${encodeURIComponent(this.email)}`,
      phone: `phone=${encodeURIComponent(this.phone)}&countryCode=${encodeURIComponent(this.countryCode)}`,
      farcaster: `farcasterUsername=${encodeURIComponent(this.farcasterUsername)}`,
    }[type];
    return `${(partnerId && (await this.getPartnerURL(partnerId))) || getPortalBaseURL(this.ctx)}/web/biometrics/login?${userSpecificParams}&sessionId=${sessionId}&encryptionKey=${loginEncryptionPublicKey}${commonLoginQueryParams}${commonQueryParams}`;
  }

  /**
   * Generates a URL that can be used to perform web auth for phone number
   * for creating a new credential.
   * @param sessionId - id of the session to use for web auth
   * @param loginEncryptionPublicKey - public key to use for encrypting the login encryption key
   * @param partnerId - id of the partner to get the portal URL for
   * @param newDeviceSessionId - id of the session to use for web auth for a new device
   * @param newDeviceEncryptionKey - public key to use for encrypting the login encryption key for a new device
   * @returns - web auth url
   */
  async getWebAuthURLForLoginForPhone(
    sessionId: string,
    loginEncryptionPublicKey: string,
    partnerId?: string,
    newDeviceSessionId?: string,
    newDeviceEncryptionKey?: string,
  ): Promise<string> {
    const commonQueryParams = await this.getCommonQueryParams(partnerId);
    const commonLoginQueryParams = await this.getCommonLoginQueryParams(newDeviceSessionId, newDeviceEncryptionKey);

    return `${(partnerId && (await this.getPartnerURL(partnerId))) || getPortalBaseURL(this.ctx)}/web/biometrics/login?phone=${encodeURIComponent(
      this.phone,
    )}&countryCode=${encodeURIComponent(this.countryCode)}&sessionId=${sessionId}&encryptionKey=${loginEncryptionPublicKey}${commonLoginQueryParams}${commonQueryParams}`;
  }

  /**
   * Gets the private key for the given wallet.
   * @param walletId - (optional) id of the wallet to get the private key for. Will default to the first wallet if not provided.
   * @returns - private key string.
   */
  async getPrivateKey(walletId?: string): Promise<string> {
    const wallets = Object.values(this.wallets);
    const wallet = walletId ? this.wallets[walletId] : wallets?.[0];

    if (!wallet) {
      throw new Error('wallet not found');
    }

    // We can only build the private key for DKLS wallets
    if (wallet.scheme !== WalletScheme.DKLS) {
      throw new Error('invalid wallet scheme');
    }

    return await this.platformUtils.getPrivateKey(
      this.ctx,
      this.userId,
      wallet.id,
      wallet.signer,
      this.retrieveSessionCookie(),
    );
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
        if (wallet.scheme === WalletScheme.ED25519 && this.ed25519Wallets[wallet.id]) {
          this.ed25519Wallets[wallet.id].address = wallet.address;
          this.ed25519Wallets[wallet.id].publicKey = wallet.publicKey;
          this.ed25519Wallets[wallet.id].scheme = wallet.scheme;
          this.ed25519Wallets[wallet.id].partnerId = wallet.partnerId;
          this.ed25519Wallets[wallet.id].userId = wallet.userId;
          delete this.wallets[wallet.id];
        } else if (this.wallets[wallet.id]) {
          this.wallets[wallet.id].address = wallet.address;
          this.wallets[wallet.id].publicKey = wallet.publicKey;
          this.wallets[wallet.id].scheme = wallet.scheme;
          this.wallets[wallet.id].partnerId = wallet.partnerId;
          this.wallets[wallet.id].userId = wallet.userId;
          delete this.ed25519Wallets[wallet.id];
        }
      },
    );
    await this.setWallets(this.wallets);
    await this.setEd25519Wallets(this.ed25519Wallets);
  }

  private async populatePregenWalletAddresses(
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType,
  ): Promise<void> {
    const res = await this.ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType);
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
        if (wallet.scheme === WalletScheme.ED25519 && this.ed25519Wallets[wallet.id]) {
          this.ed25519Wallets[wallet.id].address = wallet.address;
          this.ed25519Wallets[wallet.id].publicKey = wallet.publicKey;
          this.ed25519Wallets[wallet.id].scheme = wallet.scheme;
          this.ed25519Wallets[wallet.id].partnerId = wallet.partnerId;
          this.ed25519Wallets[wallet.id].userId = wallet.userId;
          delete this.wallets[wallet.id];
        } else if (this.wallets[wallet.id]) {
          this.wallets[wallet.id].address = wallet.address;
          this.wallets[wallet.id].publicKey = wallet.publicKey;
          this.wallets[wallet.id].scheme = wallet.scheme as WalletScheme;
          this.wallets[wallet.id].partnerId = wallet.partnerId;
          this.wallets[wallet.id].userId = wallet.userId;
          delete this.ed25519Wallets[wallet.id];
        }
      },
    );
    await this.setWallets(this.wallets);
    await this.setEd25519Wallets(this.ed25519Wallets);
  }

  /**
   * Checks if a user exists.
   * @returns - true if user exists, false otherwise.
   */
  async checkIfUserExists(email: string): Promise<boolean> {
    const res = await this.ctx.capsuleClient.checkUserExists(email, null, null);
    return res.data.exists;
  }

  /**
   * Checks if a user exists by their phone number.
   * @returns - true if user exists, false otherwise.
   */
  async checkIfUserExistsByPhone(phone: string, countryCode: CountryCallingCode): Promise<boolean> {
    const res = await this.ctx.capsuleClient.checkUserExists(null, phone, countryCode);
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
      ...this.getVerificationEmailProps(),
    });
    await this.setUserId(userId);
  }

  /**
   * Creates a new user with a phone number.
   * @param phone - phone number to use for creating the user.
   * @param countryCode - country code to use for creating the user.
   */
  async createUserByPhone(phone: string, countryCode: CountryCallingCode): Promise<void> {
    this.requireApiKey();
    await this.setPhoneNumber(phone, countryCode);
    const { userId } = await this.ctx.capsuleClient.createUser({
      phone: this.phone,
      countryCode: this.countryCode,
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
   * Passes the phone code obtained from the user for verification.
   * @param verificationCode
   * @returns - web auth url for creating a new credential
   */
  async verifyPhone(verificationCode: string): Promise<string> {
    await this.ctx.capsuleClient.verifyPhone(this.userId, { verificationCode });
    return this.getSetUpBiometricsURLForPhone(false);
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
   * Performs 2FA verification.
   * @param phone - phone to use for performing a 2FA verification.
   * @param verificationCode - verification code to received via 2FA.
   * @returns { address, initiatedAt, status, userId, walletId }
   */
  async verify2FAForPhone(
    phone: string,
    countryCode: CountryCallingCode,
    verificationCode: string,
  ): Promise<{
    address?: string;
    initiatedAt?: Date;
    status?: RecoveryStatus;
    userId: string;
    walletId: string;
  }> {
    const res = await this.ctx.capsuleClient.verify2FAForPhone(phone, countryCode, verificationCode);
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

  async resendVerificationCodeByPhone(): Promise<void> {
    await this.ctx.capsuleClient.resendVerificationCodeByPhone({
      userId: this.userId,
    });
  }

  // returns web auth url for creating a new credential
  async getSetUpBiometricsURL(isForNewDevice: boolean, type: 'email' | 'phone' | 'farcaster' = 'email'): Promise<string> {
    const res = await this.ctx.capsuleClient.addSessionPublicKey(this.userId, {
      status: PublicKeyStatus.PENDING,
      type: PublicKeyType.WEB,
    });

    return this.getWebAuthURLForCreate(type, res.data.id, res.data.partnerId, isForNewDevice);
  }

  // returns web auth url for creating a new credential
  async getSetUpBiometricsURLForPhone(isForNewDevice: boolean): Promise<string> {
    const res = await this.ctx.capsuleClient.addSessionPublicKey(this.userId, {
      status: PublicKeyStatus.PENDING,
      type: PublicKeyType.WEB,
    });

    return this.getWebAuthURLForCreate('phone', res.data.id, res.data.partnerId, isForNewDevice);
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
    const evmWalletAddress = Object.values(this.getWallets())?.[0]?.address;
    const solanaAddress = Object.values(this.getED25519Wallets())?.[0]?.address;

    return isSessionActive && !!(evmWalletAddress || solanaAddress);
  }

  /**
   * Initiates a login.
   * @param email - the email to login with
   * @param useShortURL - whether to shorten the link
   * @returns - web auth url for logging in
   **/
  async initiateUserLogin(
    identifier: string,
    useShortURL?: boolean,
    type: 'email' | 'phone' | 'farcaster' = 'email',
    countryCode?: CountryCallingCode,
  ): Promise<string> {
    if (type === 'email') {
      await this.setEmail(identifier);
    } else if (type === 'phone') {
      await this.setPhoneNumber(identifier, countryCode);
    } else if (type === 'farcaster') {
      await this.setFarcasterUsername(identifier);
    }
    const res = await this.ctx.capsuleClient.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      const keyPair = await getAsymmetricKeyPair(this.ctx);
      await this.setLoginEncryptionKeyPair(keyPair);
    }

    const webAuthLoginURL = await this.getWebAuthURLForLogin(
      res.data.sessionId,
      getPublicKeyHex(this.loginEncryptionKeyPair),
      res.data.partnerId,
      undefined,
      undefined,
      type,
    );
    if (!useShortURL) {
      return webAuthLoginURL;
    }

    return this.shortenLoginLink(webAuthLoginURL);
  }

  /**
   * Initiates a login.
   * @param phone - the phone number to login with
   * @param countryCode
   * @param useShortURL - whether to shorten the link
   * @returns - web auth url for logging in
   **/
  async initiateUserLoginForPhone(phone: string, countryCode: CountryCallingCode, useShortURL?: boolean): Promise<string> {
    await this.setPhoneNumber(phone, countryCode);
    const res = await this.ctx.capsuleClient.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      const keyPair = await getAsymmetricKeyPair(this.ctx);
      await this.setLoginEncryptionKeyPair(keyPair);
    }

    const webAuthLoginURL = await this.getWebAuthURLForLoginForPhone(
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
    // This function gets pregen wallets by an identifier and partnerId
    let pregenIdentifier: string;
    let pregenIdentifierType: PregenIdentifierType;
    if (this.email != null) {
      pregenIdentifier = this.email;
      pregenIdentifierType = PregenIdentifierType.EMAIL;
    } else {
      pregenIdentifier = parsePhoneNumberFromString(`${this.countryCode}${this.phone}`).formatInternational();
      pregenIdentifierType = PregenIdentifierType.PHONE;
    }

    const res = await this.ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType);
    const wallet = res.wallets[0];

    if (wallet) {
      const recovery = await this.claimPregenWallets(pregenIdentifier, pregenIdentifierType);
      return recovery;
    } else {
      const { recoverySecret } = await this.createWalletPerMissingType();
      return recoverySecret;
    }
  }

  async getFarcasterConnectURL(): Promise<string> {
    await this.logout();
    await this.ctx.capsuleClient.touchSession(true);
    const {
      data: { connect_uri },
    } = await this.ctx.capsuleClient.initializeFarcasterLogin();
    return connect_uri;
  }

  async waitForFarcasterStatus(): Promise<{
    userExists: boolean;
    username: string;
  }> {
    while (true) {
      try {
        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));

        const res = await this.ctx.capsuleClient.getFarcasterAuthStatus();
        if (res.data.state === 'completed') {
          const { userId, userExists, username } = res.data;
          await this.setUserId(userId);
          await this.setFarcasterUsername(username);
          return {
            userExists,
            username,
          };
        }
      } catch (err) {
        console.error(err);
      }
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

          const needsEvm = Object.keys(this.wallets).length === 0 && this.supportedWalletTypes.includes(WalletType.EVM);
          const needsSolana =
            Object.keys(this.ed25519Wallets).length === 0 && this.supportedWalletTypes.includes(WalletType.SOLANA);
          return { needsWallet: needsEvm || needsSolana };
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
    await this.setEd25519Wallets({});
    temporaryShares.forEach((share) => {
      const signer = decryptWithPrivateKey(this.loginEncryptionKeyPair.privateKey, share.encryptedShare, share.encryptedKey);
      this.wallets[share.walletId] = {
        id: share.walletId,
        signer,
      };
      this.ed25519Wallets[share.walletId] = {
        id: share.walletId,
        signer,
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
   * @param pregenIdentifier - the identifier of the user the pregen wallet is associated with.
   * @param walletId - the wallet id
   * @param pregenIdentifierType - the identifier type of the user the pregen wallet is associated with.
   * @returns - recovery share.
   **/
  private async waitForPregenWalletAddress(
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType = PregenIdentifierType.EMAIL,
    walletId: string,
  ): Promise<void> {
    let maxPolls = 0;

    while (true) {
      try {
        if (maxPolls === 10) {
          break;
        }
        ++maxPolls;
        const res = await this.ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType);

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

  async createWalletPerMissingType(skipDistribute = false): Promise<{ wallets: Wallet[]; recoverySecret?: string }> {
    const wallets: Wallet[] = [];
    let recoverySecret: string;
    if (Object.keys(this.wallets).length === 0 && this.supportedWalletTypes.includes(WalletType.EVM)) {
      const [evmWallet, evmSecret] = await this.createWallet(skipDistribute);
      wallets.push(evmWallet);
      if (evmSecret) {
        recoverySecret = evmSecret;
      }
    }

    if (Object.keys(this.ed25519Wallets).length === 0 && this.supportedWalletTypes.includes(WalletType.SOLANA)) {
      const [ed25519Wallet, ed25519Secret] = await this.createWallet(skipDistribute, undefined, true);
      wallets.push(ed25519Wallet);
      if (ed25519Secret) {
        recoverySecret = ed25519Secret;
      }
    }
    return { wallets, recoverySecret };
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
    _customFunction?: (params?: any) => void,
    useED25519?: boolean,
  ): Promise<[Wallet, string | null]> {
    this.requireApiKey();

    let signer: string;
    let wallet: Wallet;
    if (useED25519) {
      const keygenRes = await this.platformUtils.ed25519Keygen(
        this.ctx,
        this.userId,
        this.retrieveSessionCookie(),
        this.getBackupKitEmailProps(),
      );
      const walletId = keygenRes.walletId;
      signer = keygenRes.signer;

      this.ed25519Wallets[walletId] = {
        id: walletId,
        signer,
      };
      wallet = this.ed25519Wallets[walletId];
    } else {
      const keygenRes = await this.platformUtils.keygen(
        this.ctx,
        this.userId,
        null,
        this.retrieveSessionCookie(),
        this.getBackupKitEmailProps(),
      );
      const walletId = keygenRes.walletId;
      signer = keygenRes.signer;

      this.wallets[walletId] = {
        id: walletId,
        signer,
      };
      wallet = this.wallets[walletId];
    }

    await this.waitForWalletAddress(wallet.id);
    await this.populateWalletAddresses();

    let recoveryShare: string | null = null;
    if (!skipDistribute) {
      recoveryShare = await distributeNewShare(
        this.ctx,
        this.userId,
        wallet.id,
        signer,
        false,
        this.getBackupKitEmailProps(),
      );
    }

    return [wallet, recoveryShare];
  }

  /**
   * Creates a new pregenerated wallet.
   *
   * @param pregenIdentifier - string
   * @param pregenIdentifierType - PregenIdentifierType
   * @returns [wallet, recoveryShare]
   **/
  async createWalletPreGen(
    pregenIdentifier: string,
    useSolana?: boolean,
    pregenIdentifierType: PregenIdentifierType = PregenIdentifierType.EMAIL,
  ): Promise<Wallet> {
    this.requireApiKey();
    let walletId: string;
    if (useSolana) {
      const { signer, walletId: newWalletId } = await this.platformUtils.ed25519PreKeygen(
        this.ctx,
        pregenIdentifier,
        pregenIdentifierType,
        this.retrieveSessionCookie(),
      );
      walletId = newWalletId;

      this.ed25519Wallets[walletId] = {
        id: walletId,
        signer,
      };
    } else {
      const { signer, walletId: newWalletId } = await this.platformUtils.preKeygen(
        this.ctx,
        undefined,
        pregenIdentifier,
        pregenIdentifierType,
        null,
        this.retrieveSessionCookie(),
      );

      walletId = newWalletId;
      this.wallets[walletId] = {
        id: walletId,
        signer,
      };
    }

    await this.waitForPregenWalletAddress(pregenIdentifier, pregenIdentifierType, walletId);
    await this.populatePregenWalletAddresses(pregenIdentifier, pregenIdentifierType);

    return useSolana ? this.ed25519Wallets[walletId] : this.wallets[walletId];
  }

  /**
   * Claims a pregenerated wallet.
   *
   * @param pregenIdentifier string the identifier of the user claiming the wallet
   * @param pregenIdentifierType type of the identifier of the user claiming the wallet
   * @returns [wallet, recoveryShare]
   **/
  async claimPregenWallets(
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType = PregenIdentifierType.EMAIL,
  ): Promise<string | undefined> {
    this.requireApiKey();
    if (pregenIdentifierType === PregenIdentifierType.EMAIL) {
      const userExist = await this.checkIfUserExists(pregenIdentifier);
      if (!userExist) {
        throw new Error('user does not exist');
      }
    } else {
      const phoneNumber = parsePhoneNumberFromString(pregenIdentifier);
      const number = phoneNumber.formatNational();
      const countryCallingCode = `+${phoneNumber.countryCallingCode}`;
      const userExist = await this.checkIfUserExistsByPhone(number, countryCallingCode as CountryCallingCode);
      if (!userExist) {
        throw new Error('user does not exist');
      }
    }

    // This function gets pregen wallets by email and partnerId
    const res = await this.ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType);
    if (res.wallets.length === 0) {
      throw new Error('wallets not found');
    }

    let recoverySecret: string | undefined;
    for (const wallet of res.wallets) {
      await this.ctx.capsuleClient.claimPregenWallet({ userId: this.userId, walletId: wallet.id });

      const signer =
        wallet.scheme === WalletScheme.ED25519 ? this.ed25519Wallets[wallet.id].signer : this.wallets[wallet.id].signer;
      const recoveryShare = await distributeNewShare(
        this.ctx,
        this.userId,
        wallet.id,
        signer,
        false,
        this.getBackupKitEmailProps(),
      );
      if (recoveryShare) {
        recoverySecret = recoveryShare;
      }

      if (wallet.scheme === WalletScheme.ED25519) {
        this.ed25519Wallets[wallet.id].userId = this.userId;
        await this.setEd25519Wallets(this.ed25519Wallets);
      } else {
        this.wallets[wallet.id].userId = this.userId;
        await this.setWallets(this.wallets);
      }
    }

    return recoverySecret;
  }

  /**
   * Updates a pregenerated wallet identifier.
   *
   * @param newIdentifier - string
   * @param walletId - string
   * @returns Promise<void>
   **/
  async updateWalletIdentifierPreGen(
    newIdentifier: string,
    walletId?: string,
    type: PregenIdentifierType = PregenIdentifierType.EMAIL,
  ): Promise<void> {
    this.requireApiKey();
    const currentWalletId = walletId || Object.keys(this.wallets)[0];
    await this.ctx.capsuleClient.updatePregenWallet(currentWalletId, {
      pregenIdentifier: newIdentifier,
      pregenIdentifierType: type,
    });
  }

  /**
   * Checks if Pregen Wallet exists for the identifier and partnerId
   *
   * @param pregenIdentifier string the identifier of the user claiming the wallet
   * @param pregenIdentifierType type of the string of the identifier of the user claiming the wallet
   * @returns Promise<boolean>
   **/
  async hasPregenWallet(
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType = PregenIdentifierType.EMAIL,
  ): Promise<boolean> {
    this.requireApiKey();

    // This function gets pregen wallets by identifier and partnerId
    const res = await this.ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType);
    const wallet = res.wallets[0];
    if (!wallet) {
      return false;
    }
    return true;
  }

  /**
   * Get pregen wallets for the identifier
   *
   * @param {string} pregenIdentifier - the identifier of the user claiming the wallet
   * @param {PregenIdentifierType} pregenIdentifierType - type of the identifier of the user claiming the wallet
   * @returns {Promise<WalletEntity[]>} Promise of pregen wallets
   **/
  async getPregenWallets(
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType = PregenIdentifierType.EMAIL,
  ): Promise<WalletEntity[]> {
    this.requireApiKey();

    const res = await this.ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType);
    return res.wallets;
  }

  private encodeWalletBase64(wallet: Wallet): string {
    const walletJson = JSON.stringify(wallet);
    const base64Wallet = Buffer.from(walletJson).toString('base64');
    return base64Wallet;
  }

  /**
   * Returns a base64 encoded wallet
   *
   * @returns string base64 encoded wallet
   **/
  getUserShare(): string | null {
    const wallet = Object.values(this.wallets)[0];
    const ed25519Wallet = Object.values(this.ed25519Wallets)[0];

    if (wallet && ed25519Wallet) {
      return `${this.encodeWalletBase64(wallet)}-${this.encodeWalletBase64(ed25519Wallet)}`;
    } else if (wallet || ed25519Wallet) {
      return this.encodeWalletBase64(wallet || ed25519Wallet);
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
  async setUserShare(base64Wallets: string): Promise<void> {
    const base64WalletsSplit = base64Wallets.split('-');
    for (const base64Wallet of base64WalletsSplit) {
      const walletJson = Buffer.from(base64Wallet, 'base64').toString();
      const wallet = JSON.parse(walletJson) as Wallet;
      if (wallet.scheme === WalletScheme.ED25519) {
        this.ed25519Wallets[wallet.id] = wallet;
        await this.setEd25519Wallets(this.ed25519Wallets);
      } else {
        this.wallets[wallet.id] = wallet;
        await this.setWallets(this.wallets);
      }
    }
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
    const wallet = this.wallets[walletId] || this.ed25519Wallets[walletId];
    let signerId: string = this.userId;
    if (wallet.partnerId && !wallet.userId) {
      signerId = wallet.partnerId;
    }
    if (wallet.scheme === WalletScheme.ED25519) {
      const res = await this.platformUtils.ed25519Sign(
        this.ctx,
        signerId,
        walletId,
        wallet.signer,
        messageBase64,
        this.retrieveSessionCookie(),
      );
      if ((res as DeniedSignatureRes).pendingTransactionId) {
        return {
          ...res,
          transactionReviewUrl: this.getTransactionReviewUrl((res as DeniedSignatureRes).pendingTransactionId),
        };
      }

      return res as SuccessfulSignatureRes;
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
   * Initiate a new on-ramp purchase through the Capsule modal.
   *
   * @param provider - one of `RAMP` or `STRIPE`.
   * @param asset - the on-chain asset to purchase, one of `USDC` or `ETH`
   * @param testMode - if `true`, the purchase involves test-net assets only
   * @returns - the created purchase object
   **/
  async createOnRampPurchase(
    provider: OnRampProviderProp,
    asset: OnRampAssetProp,
    testMode = false,
    walletId: string = Object.keys(this.wallets)[0],
  ): Promise<OnRampPurchase> {
    const res = await this.ctx.capsuleClient.createOnRampPurchase(
      this.getUserId(),
      walletId,
      getProvider(provider),
      getAsset(asset),
      testMode,
    );

    return res.data;
  }

  /**
   * Update an on-ramp purchase.
   *
   * @param walletId - the uuid of the desired purchase's associated wallet
   * @param purchaseId - the uuid of the desired purchase
   * @param updates - the updates to apply, limited to `status`, `fiatCurrency`, `fiatQuantity`, `asset`', `assetQuantity`', and `providerKey``
   * @returns - the updated purchase object
   **/
  async updateOnRampPurchase(
    walletId: string,
    purchaseId: string,
    updates: Partial<
      Pick<OnRampPurchase, 'status' | 'fiatCurrency' | 'fiatQuantity' | 'asset' | 'assetQuantity' | 'providerKey'>
    >,
  ): Promise<OnRampPurchase> {
    const res = await this.ctx.capsuleClient.updateOnRampPurchase(this.getUserId(), walletId, purchaseId, updates);

    return res.data;
  }

  /**
   * Retrieve a desired on-ramp purchase.
   *
   * @param walletId - the ID of the purchase's wallet.
   * @param purchaseId - the purchase ID to retrieve.
   * @returns - the purchase object
   **/
  async getOnRampPurchase(walletId: string, purchaseId: string): Promise<OnRampPurchase> {
    const res = await this.ctx.capsuleClient.getOnRampPurchase(this.getUserId(), walletId, purchaseId);

    return res.data;
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
      ed25519Wallets: this.ed25519Wallets,
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
    await this.setEd25519Wallets(sessionInfo.ed25519Wallets);
    this.persistSessionCookie(sessionInfo.sessionCookie);
  }

  /**
   * Logs the user out.
   **/
  async logout(): Promise<void> {
    await this.ctx.capsuleClient.logout();
    await this.clearStorage();
    this.wallets = {};
    this.ed25519Wallets = {};
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
