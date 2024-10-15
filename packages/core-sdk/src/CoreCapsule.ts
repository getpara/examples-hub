import Client, {
  BackupKitEmailProps,
  CurrentWalletIds,
  EmailTheme,
  PartnerEntity,
  PublicKeyStatus,
  PublicKeyType,
  VerificationEmailProps,
  WalletEntity,
  WalletType,
  WalletScheme,
  WalletParams,
  OnRampPurchaseCreateParams,
  OnRampPurchase,
  extractWalletRef,
} from '@usecapsule/user-management-client';
import qs from 'qs';
import type { pki as pkiType, jsbn as jsbnType } from 'node-forge';
import forge from 'node-forge';
const { pki, jsbn } = forge;

import { decryptWithPrivateKey, getAsymmetricKeyPair, getPublicKeyHex } from './cryptography/utils.js';
import {
  CURRENT_WALLET_IDS_CHANGE_EVENT,
  Ctx,
  EXTERNAL_WALLET_CHANGE_EVENT,
  WalletSchemeTypeMap,
  getPortalBaseURL,
  Environment,
  OAuthMethod,
  WalletFilters,
  WalletTypeProp,
} from './definitions.js';
import { getBaseUrl, initClient } from './external/capsuleClient.js';
import * as mpcComputationClient from './external/mpcComputationClient.js';
import { distributeNewShare } from './shares/shareDistribution.js';
import { Theme, FullSignatureRes, SuccessfulSignatureRes, DeniedSignatureRes, PopupType } from './types/index.js';
import * as transmissionUtils from './transmission/transmissionUtils.js';
import { PlatformUtils } from './PlatformUtils.js';
import { sendRecoveryForShare } from './shares/recovery.js';
import parsePhoneNumberFromString, { CountryCallingCode } from 'libphonenumber-js';
import { getCosmosAddress, truncateAddress } from './utils/formattingUtils.js';
import { TransactionReviewDenied, TransactionReviewError, TransactionReviewTimeout } from './errors.js';

const CORE_CAPSULE_VERSION = process.env.CORE_CAPSULE_VERSION;

export function entityToWallet(w: WalletEntity): Omit<Wallet, 'signer'> {
  return {
    ...w,
    scheme: w.scheme as WalletScheme,
    type: w.type as WalletType,
    pregenIdentifierType: w.pregenIdentifierType as PregenIdentifierType,
  };
}

function migrateWallet(obj: Record<string, unknown>) {
  if (['USER', 'PREGEN'].includes(obj.type as string)) {
    obj.isPregen = obj.type === 'PREGEN';
    obj.type = obj.scheme === WalletScheme.ED25519 ? WalletType.SOLANA : WalletType.EVM;
  }

  return obj;
}
export type EmbeddedWalletType = Exclude<WalletType, never>;

export type ExternalWalletType = Exclude<WalletType, never>;

export type SupportedWalletTypeConfig = {
  optional?: boolean;
};

export type deprecated__SupportedWalletTypesOpt = {
  [WalletType.EVM]?: boolean | SupportedWalletTypeConfig;
  [WalletType.SOLANA]?: boolean | SupportedWalletTypeConfig;
  [WalletType.COSMOS]?: boolean | (SupportedWalletTypeConfig & { prefix?: string });
};

export type SupportedWalletTypes = { type: WalletType; optional?: boolean }[];

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
  createdAt?: string;
  id: string;
  name?: string;
  signer: string;
  address?: string;
  addressSecondary?: string;
  publicKey?: string;
  scheme?: WalletScheme;
  type?: EmbeddedWalletType | ExternalWalletType;
  isPregen?: boolean;
  pregenIdentifier?: string;
  pregenIdentifierType?: PregenIdentifierType;
  userId?: string;
  partnerId?: string;
  partner?: PartnerEntity;
  lastUsedAt?: string;
  lastUsedPartner?: PartnerEntity;
  lastUsedPartnerId?: string;
  isExternal?: boolean;
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
  /**
   * Hex color to use in the portal for the background color.
   * @deprecated use portalTheme instead
   */
  portalBackgroundColor?: string; // please use hex color codes
  /**
   * Hex color to use in the portal for the primary button.
   * @deprecated use portalTheme instead
   */
  portalPrimaryButtonColor?: string; // please use hex color codes
  /**
   * Hex text color to use in the portal.
   * @deprecated use portalTheme instead
   */
  portalTextColor?: string; // please use hex color codes
  /**
   * Hex color to use in the portal for the primary button text.
   * @deprecated use portalTheme instead
   */
  portalPrimaryButtonTextColor?: string; // please use hex color codes
  /**
   * Theme to use for the portal
   * @deprecated configure theming through the developer portal
   */
  portalTheme?: Theme;
  useDKLSForCreation?: boolean;
  disableWebSockets?: boolean;
  wasmOverride?: ArrayBuffer;
  /**
   * Base theme for the emails sent from this Capsule instance.
   * @default - dark
   * @deprecated configure theming through the developer portal
   */
  emailTheme?: EmailTheme;
  /**
   * Hex color to use as the primary color in the emails.
   * @default - #FE452B
   * @deprecated configure theming through the developer portal
   */
  emailPrimaryColor?: string;
  /**
   * Linkedin URL to link to in the emails. Should be a secure URL string starting with https://www.linkedin.com/company/.
   * @deprecated configure this through the developer portal
   */
  linkedinUrl?: string;
  /**
   * Github URL to link to in the emails. Should be a secure URL string starting with https://github.com/.
   * @deprecated configure this through the developer portal
   */
  githubUrl?: string;
  /**
   * X (Twitter) URL to link to in the emails. Should be a secure URL string starting with https://twitter.com/.
   * @deprecated configure this through the developer portal
   */
  xUrl?: string;
  /**
   * Support URL to link to in the emails. This can be a secure https URL or a mailto: string. Will default to using the stored application URL is nothing is provided here.
   * @deprecated homepageUrl will be used for this, configure it through the developer portal
   */
  supportUrl?: string;
  /**
   * URL for your home landing page. Should be a secure URL string starting with https://.
   * @deprecated configure this through the developer portal
   */
  homepageUrl?: string;
  /**
   * Which type of wallet your application supports, in the form `{ [WalletType]: true }`. Currently allowed values for `WalletType` are `'EVM'`, `'SOLANA'`, or `'COSMOS'`.
   *
   * To specify which prefix to use for new Cosmos wallets, pass `{ COSMOS: { prefix: 'your-prefix' } }`. Defaults to `'cosmos'`.
   * @deprecated Configure your app's supported wallet types in the Capsule Developer Portal.
   */
  supportedWalletTypes?: deprecated__SupportedWalletTypesOpt;
  /**
   * If `true`, the SDK will use the device's temporary session storage instead of saving user and wallet data to local storage.
   */
  useSessionStorage?: boolean;
}

export const PREFIX = '@CAPSULE/';
const LOCAL_STORAGE_EMAIL = `${PREFIX}e-mail`;
const LOCAL_STORAGE_PHONE = `${PREFIX}phone`;
const LOCAL_STORAGE_COUNTRY_CODE = `${PREFIX}countryCode`;
const LOCAL_STORAGE_FARCASTER_USERNAME = `${PREFIX}farcasterUsername`;
const LOCAL_STORAGE_USER_ID = `${PREFIX}userId`;
const LOCAL_STORAGE_ED25519_WALLETS = `${PREFIX}ed25519Wallets`;
const LOCAL_STORAGE_WALLETS = `${PREFIX}wallets`;
const LOCAL_STORAGE_EXTERNAL_WALLETS = `${PREFIX}externalWallets`;
const LOCAL_STORAGE_CURRENT_WALLET_IDS = `${PREFIX}currentWalletIds`;
const LOCAL_STORAGE_CURRENT_EXTERNAL_WALLET_ADDRESSES = `${PREFIX}currentExternalWalletAddresses`;
const LOCAL_STORAGE_SESSION_COOKIE = `${PREFIX}sessionCookie`;
const SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR = `${PREFIX}loginEncryptionKeyPair`;
const POLLING_INTERVAL_MS = 2000;
const SHORT_POLLING_INTERVAL_MS = 1000;

export function stringToPhoneNumber(str: string): string {
  return parsePhoneNumberFromString(str)
    ?.formatInternational()
    .replace(/[^\d+]/g, '');
}

export function normalizePhoneNumber(countryCode: string, number: string): string | undefined {
  return stringToPhoneNumber(`${countryCode[0] !== '+' ? '+' : ''}${countryCode}${number}`);
}

export function toQueryString(obj: Record<string, string>) {
  return Object.entries(obj)
    .map(([key, value]) => (value ? `&${key}=${encodeURIComponent(value)}` : ''))
    .join('');
}

export function isWalletSupported(types: WalletType[], wallet: Omit<Wallet, 'signer'>): boolean {
  return types.some((walletType: WalletType) => !!WalletSchemeTypeMap[wallet.scheme][walletType]);
}

function getSchemes(types: WalletTypeProp[] | SupportedWalletTypes): WalletScheme[] {
  return <WalletScheme[]>Object.keys(WalletSchemeTypeMap).filter(scheme => {
    if (scheme === WalletScheme.CGGMP) {
      return false;
    }
    return (Array.isArray(types) ? types : Object.keys(types)).some(type => WalletSchemeTypeMap[scheme][type]);
  });
}

export function getWalletTypes(schemes: WalletScheme[]): WalletType[] {
  return [
    ...new Set(
      schemes.reduce((acc, scheme) => {
        return [...acc, ...Object.keys(WalletSchemeTypeMap[scheme]).filter(type => WalletSchemeTypeMap[scheme][type])];
      }, []),
    ),
  ];
}

export function getEquivalentTypes(types: WalletTypeProp[] | WalletTypeProp): WalletType[] {
  return getWalletTypes(getSchemes((Array.isArray(types) ? types : [types]).map(t => WalletType[t])));
}

export function isCosmosRequired(supportedWalletTypes: SupportedWalletTypes): boolean {
  return supportedWalletTypes.some(({ type, optional }) => type === WalletType.COSMOS && !optional);
}
export abstract class CoreCapsule {
  static version?: string = CORE_CAPSULE_VERSION;

  ctx: Ctx;

  private email?: string;
  private phone?: string;
  private countryCode?: CountryCallingCode;
  private farcasterUsername?: string;
  private userId?: string;
  private sessionCookie?: string;

  private isAwaitingAccountCreation = false;
  private isAwaitingLogin = false;
  private isAwaitingFarcaster = false;
  private isAwaitingOAuth = false;

  /**
   * The IDs of the currently active wallets, for each supported wallet type. Any signer integrations will default to the first viable wallet ID in this dictionary.
   */
  currentWalletIds: CurrentWalletIds = {};

  get currentWalletIdsArray(): [string, WalletType][] {
    return this.supportedWalletTypes.reduce((acc, { type }) => {
      return [
        ...acc,
        ...(this.currentWalletIds[type] ?? []).map(id => {
          return [id, type];
        }),
      ];
    }, []);
  }

  get currentWalletIdsUnique(): string[] {
    return [...new Set(Object.values(this.currentWalletIds).flat())];
  }

  /**
   * Wallets associated with the `CoreCapsule` instance. Retrieve a particular wallet using `capsule.wallets[walletId]`.
   */
  wallets: Record<string, Wallet>;

  /**
   * The addresses of the currently active external wallets.
   */
  currentExternalWalletAddresses?: string[];

  /**
   * Wallets associated with the `CoreCapsule` instance.
   */
  externalWallets: Record<string, Wallet>;

  /**
   * Whether the instance has multiple wallets connected.
   */
  get isMultiWallet(): boolean {
    return this.currentWalletIdsArray.length > 1;
  }

  /**
   * Base theme for the emails sent from this Capsule instance.
   * @default - dark
   * @deprecated configure theming through the developer portal
   */
  emailTheme?: EmailTheme;

  /**
   * Hex color to use as the primary color in the emails.
   * @default - #FE452B
   * @deprecated configure theming through the developer portal
   */
  emailPrimaryColor?: string;

  /**
   * Linkedin URL to link to in the emails. Should be a secure URL string starting with https://www.linkedin.com/company/.
   * @deprecated configure this through the developer portal
   */
  linkedinUrl?: string;

  /**
   * Github URL to link to in the emails. Should be a secure URL string starting with https://github.com/.
   * @deprecated configure this through the developer portal
   */
  githubUrl?: string;

  /**
   * X (Twitter) URL to link to in the emails. Should be a secure URL string starting with https://twitter.com/.
   * @deprecated configure this through the developer portal
   */
  xUrl?: string;

  /**
   * Support URL to link to in the emails. This can be a secure https URL or a mailto: string. Will default to using the stored application URL is nothing is provided here.
   * @deprecated homepageUrl will be used for this, configure it through the developer portal
   */
  supportUrl?: string;

  /**
   * URL for your home landing page. Should be a secure URL string starting with https://.
   * @deprecated configure this through the developer portal
   */
  homepageUrl?: string;

  /**
   * Encryption key pair generated from loginEncryptionKey.
   */
  loginEncryptionKeyPair?: pkiType.rsa.KeyPair;

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
   * @deprecated configure theming through the developer portal
   */
  portalTheme?: Theme;

  private disableProviderModal?: boolean;

  #supportedWalletTypes: SupportedWalletTypes | undefined = undefined;

  #supportedWalletTypesOpt: deprecated__SupportedWalletTypesOpt | undefined = undefined;

  get supportedWalletTypes(): SupportedWalletTypes {
    return this.#supportedWalletTypes ?? [];
  }

  get isWalletTypeEnabled(): Partial<Record<WalletType, boolean>> {
    return this.supportedWalletTypes.reduce((acc, { type }) => {
      return { ...acc, [type]: true };
    }, {});
  }

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
  persistSessionCookie: (cookie: string) => void;

  /**
   * Remove all local storage and prefixed session storage.
   * @param {'local' | 'session' | 'secure' | 'all'} type - Type of storage to clear. Defaults to 'all'.
   */
  clearStorage = async (type: 'local' | 'session' | 'secure' | 'all' = 'all'): Promise<void> => {
    const isAll = type === 'all';
    (isAll || type === 'local') && this.platformUtils.localStorage.clear(PREFIX);
    (isAll || type === 'session') && this.platformUtils.sessionStorage.clear(PREFIX);
    if ((isAll || type === 'secure') && this.platformUtils.secureStorage) {
      this.platformUtils.secureStorage.clear(PREFIX);
    }
  };

  private convertBigInt(bigInt: Record<string, any>): jsbnType.BigInteger {
    const convertedBigInt = new jsbn.BigInteger(null);
    convertedBigInt.data = bigInt.data;
    convertedBigInt.s = bigInt.s;
    convertedBigInt.t = bigInt.t;
    return convertedBigInt;
  }

  private convertEncryptionKeyPair(jsonKeyPair: Record<string, any>): pkiType.rsa.KeyPair {
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

  private isPortal(): boolean {
    return typeof window !== 'undefined' && getPortalBaseURL(this.ctx).includes(window.location.host);
  }

  private requireApiKey() {
    if (!this.ctx.apiKey) {
      throw new Error(
        `in order to create a wallet or user with Capsule, you
        must provide an API key to the capsule instance`,
      );
    }
  }

  private isWalletSupported(wallet: Omit<Wallet, 'signer'>): boolean {
    return isWalletSupported(this.supportedWalletTypes.map(({ type }) => type) ?? [], wallet);
  }

  private isWalletOwned(wallet: Wallet): boolean {
    return (
      this.isWalletSupported(wallet) &&
      !wallet.pregenIdentifier &&
      !wallet.pregenIdentifierType &&
      !!this.userId &&
      wallet.userId === this.userId
    );
  }

  private isPregenWalletUnclaimed(wallet: Wallet): boolean {
    return (
      this.isWalletSupported(wallet) &&
      (!wallet.userId || (wallet.isPregen && !!wallet.pregenIdentifier && !!wallet.pregenIdentifierType))
    );
  }

  private isPregenWalletClaimable(wallet: Wallet): boolean {
    return (
      this.isWalletSupported(wallet) &&
      this.isPregenWalletUnclaimed(wallet) &&
      ((wallet.pregenIdentifier === this.email && wallet.pregenIdentifierType === PregenIdentifierType.EMAIL) ||
        (stringToPhoneNumber(wallet.pregenIdentifier) === this.getPhoneNumber() &&
          wallet.pregenIdentifierType === PregenIdentifierType.PHONE))
    );
  }

  private isWalletUsable(
    walletId: string,
    { type: types, scheme: schemes, forbidPregen = false }: WalletFilters = {},
    throwError = false,
  ): boolean {
    let error;

    if (!this.wallets[walletId]) {
      error = `wallet with id ${walletId} does not exist`;
    } else {
      const wallet = this.wallets[walletId];

      const [isUnclaimed, isOwned] = [this.isPregenWalletUnclaimed(wallet), this.isWalletOwned(wallet)];

      if (forbidPregen && isUnclaimed) {
        error = `pre-generated wallet with id ${wallet.id} cannot be selected`;
      } else if (!isOwned && !isUnclaimed) {
        error = `wallet with id ${wallet.id} is not owned by the current user`;
      } else if (!this.isWalletSupported(wallet)) {
        error = `wallet with id ${wallet.id} and type ${wallet.type} is not supported, supported types are: ${this.supportedWalletTypes.map(({ type }) => type).join(', ')}`;
      } else if (
        types &&
        (!getEquivalentTypes(types).includes(wallet.type) ||
          (isOwned && !types.some(type => (this.currentWalletIds[type] ?? []).includes(walletId))))
      ) {
        error = `wallet with id ${wallet.id} and type ${wallet.type} cannot be selected`;
      } else if (schemes && !schemes.includes(wallet.scheme)) {
        error = `wallet with id ${wallet.id} and scheme ${wallet.scheme} cannot be selected`;
      }
    }

    if (error) {
      if (throwError) {
        throw new Error(error);
      }
      return false;
    }

    return true;
  }

  /**
   * Returns the formatted address for the desired wallet ID, depending on your app settings.
   * @param {string} walletId the ID of the wallet address to display.
   * @param {object} options additional options for formatting the address.
   * @param {boolean} options.truncate whether to truncate the address.
   * @param {WalletType} options.addressType the type of address to display.
   * @returns the formatted address
   */
  getDisplayAddress(
    walletId: string,
    options: { truncate?: boolean; addressType?: WalletTypeProp | undefined } | undefined = {},
  ): string {
    if (this.externalWallets[walletId]) {
      const wallet = this.externalWallets[walletId];

      return options.truncate ? truncateAddress(wallet.address, wallet.type, { prefix: this.cosmosPrefix }) : wallet.address;
    }

    const wallet = this.findWallet(walletId, options.addressType);

    if (!wallet) {
      return undefined;
    }

    let str: string;

    switch (wallet.type) {
      case WalletType.COSMOS:
        str = getCosmosAddress(wallet.publicKey!, this.cosmosPrefix ?? 'cosmos');
        break;
      default:
        str = wallet.address;
        break;
    }

    return options.truncate ? truncateAddress(str, wallet.type, { prefix: this.cosmosPrefix }) : str;
  }

  /**
   * Returns a unique hash for a wallet suitable for use as an identicon seed.
   * @param {string} walletId the ID of the wallet.
   * @param {boolean} options.addressType used to format the hash for another wallet type.
   * @returns the identicon hash string
   */
  getIdenticonHash(walletId: string, overrideType?: WalletType): string | undefined {
    if (this.externalWallets[walletId]) {
      const wallet = this.externalWallets[walletId];

      return `${wallet.id}-${wallet.address}-${wallet.type}`;
    }

    const wallet = this.findWallet(walletId, overrideType);

    return wallet ? `${wallet.id}-${wallet.address}-${wallet.type}` : undefined;
  }

  getWallets(): Record<string, Wallet> {
    return this.wallets;
  }

  getAddress(walletId?: string): string | undefined {
    return walletId ? this.wallets[walletId].address : Object.values(this.wallets)?.[0]?.address;
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

    if (opts.useSessionStorage) {
      this.localStorageGetItem = this.sessionStorageGetItem;
      this.localStorageSetItem = this.sessionStorageSetItem;
    }

    this.persistSessionCookie = (cookie: string) => {
      this.sessionCookie = cookie;
      (opts.useSessionStorage ? this.sessionStorageSetItem : this.localStorageSetItem)(LOCAL_STORAGE_SESSION_COOKIE, cookie);
    };

    this.ctx = {
      env,
      apiKey,
      capsuleClient: initClient(
        env,
        CoreCapsule.version,
        apiKey,
        opts.disableWorkers,
        this.retrieveSessionCookie,
        this.persistSessionCookie,
      ),
      disableWorkers: opts.disableWorkers,
      offloadMPCComputationURL: opts.offloadMPCComputationURL,
      useLocalFiles: opts.useLocalFiles,
      useDKLS: opts.useDKLSForCreation || !opts.offloadMPCComputationURL,
      disableWebSockets: !!opts.disableWebSockets,
      wasmOverride: opts.wasmOverride,
      cosmosPrefix: this.cosmosPrefix,
    };
    if (opts.offloadMPCComputationURL) {
      this.ctx.mpcComputationClient = mpcComputationClient.initClient(opts.offloadMPCComputationURL, opts.disableWorkers);
    }

    if (!this.platformUtils.isSyncStorage || opts.useStorageOverrides) {
      return;
    }

    this.email = (this.localStorageGetItem(LOCAL_STORAGE_EMAIL) as string) || undefined;
    this.countryCode = (this.localStorageGetItem(LOCAL_STORAGE_COUNTRY_CODE) as CountryCallingCode) || undefined;
    this.phone = (this.localStorageGetItem(LOCAL_STORAGE_PHONE) as string) || undefined;
    this.userId = (this.localStorageGetItem(LOCAL_STORAGE_USER_ID) as string) || undefined;

    const stringWallets = this.platformUtils.secureStorage
      ? this.platformUtils.secureStorage.get(LOCAL_STORAGE_WALLETS)
      : this.localStorageGetItem(LOCAL_STORAGE_WALLETS);
    const _wallets = JSON.parse((stringWallets as string) || '{}');
    const stringEd25519Wallets = this.platformUtils.secureStorage
      ? this.platformUtils.secureStorage.get(LOCAL_STORAGE_ED25519_WALLETS)
      : this.localStorageGetItem(LOCAL_STORAGE_ED25519_WALLETS);
    const _ed25519Wallets = JSON.parse((stringEd25519Wallets as string) || '{}');

    const wallets = {
      ...Object.keys(_wallets).reduce((res, key) => {
        return {
          ...res,
          [key]: migrateWallet(_wallets[key]),
        };
      }, {}),
      ...Object.keys(_ed25519Wallets).reduce((res, key) => {
        return {
          ...res,
          ...(!res[key] ? { [key]: migrateWallet(_ed25519Wallets[key]) } : {}),
        };
      }, {}),
    };

    this.setWallets(wallets);

    // Support legacy supportedWalletTypes
    try {
      this.#supportedWalletTypes = opts.supportedWalletTypes
        ? ((() => {
            if (
              Object.values(opts.supportedWalletTypes).every(
                config => !!config && typeof config === 'object' && config.optional,
              )
            ) {
              throw new Error('at least one wallet type must be non-optional');
            }

            if (
              !Object.keys(opts.supportedWalletTypes).every(type => Object.values(WalletType).includes(<WalletType>type))
            ) {
              throw new Error('unsupported wallet type');
            }

            this.#supportedWalletTypesOpt = opts.supportedWalletTypes;

            return Object.entries(opts.supportedWalletTypes).reduce((acc, [key, value]) => {
              if (!value) {
                return acc;
              }

              if (
                key === WalletType.COSMOS &&
                typeof value === 'object' &&
                !!(value as Partial<{ prefix?: string }>).prefix
              ) {
                this.cosmosPrefix = (value as Partial<{ prefix?: string }>).prefix;
              }

              return [...acc, { type: key, optional: value === true ? false : (value.optional ?? false) }];
            }, []);
          })() as SupportedWalletTypes)
        : undefined;
    } catch (e) {
      this.#supportedWalletTypes = undefined;
    }

    // TODO: Improve not great check
    const _currentWalletIds = (this.localStorageGetItem(LOCAL_STORAGE_CURRENT_WALLET_IDS) as string) ?? undefined;
    const currentWalletIds = [undefined, null, 'undefined'].includes(_currentWalletIds)
      ? {}
      : (() => {
          const fromJson = JSON.parse(_currentWalletIds);

          return Array.isArray(fromJson)
            ? Object.keys(WalletType).reduce((acc: CurrentWalletIds, type: WalletType) => {
                const wallet = Object.values(this.wallets).find(
                  w => fromJson.includes(w.id) && WalletSchemeTypeMap[w.scheme][type],
                );
                return {
                  ...acc,
                  ...(wallet && !acc[type] ? { [type]: [wallet.id] } : {}),
                };
              }, {})
            : fromJson;
        })();

    this.setCurrentWalletIds(currentWalletIds);

    // TODO: remove sessionStorageGetItem call once new version is being consumed
    this.sessionCookie =
      (this.localStorageGetItem(LOCAL_STORAGE_SESSION_COOKIE) as string) ||
      (this.sessionStorageGetItem(LOCAL_STORAGE_SESSION_COOKIE) as string) ||
      undefined;

    // In case currentWalletIds was missing from storage
    if (
      Object.values(this.wallets).filter(w => this.isWalletOwned(w)).length > 0 &&
      this.currentWalletIdsArray.length === 0
    ) {
      this.findWalletId(undefined, { forbidPregen: true });
    }

    const loginEncryptionKey = this.sessionStorageGetItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR) as string | null;
    if (loginEncryptionKey && loginEncryptionKey !== 'undefined') {
      this.loginEncryptionKeyPair = this.convertEncryptionKeyPair(JSON.parse(loginEncryptionKey));
    }

    const stringExternalWallets = this.localStorageGetItem(LOCAL_STORAGE_EXTERNAL_WALLETS);
    const _externalWallets = JSON.parse((stringExternalWallets as string) || '{}');

    this.setExternalWallets(_externalWallets);

    const _currentExternalWalletAddresses =
      (this.localStorageGetItem(LOCAL_STORAGE_CURRENT_EXTERNAL_WALLET_ADDRESSES) as string) || undefined;
    this.currentExternalWalletAddresses = _currentExternalWalletAddresses
      ? JSON.parse(_currentExternalWalletAddresses)
      : undefined;
  }

  async touchSession(regenerate = false): Promise<Awaited<ReturnType<Client['touchSession']>>> {
    const res = await this.ctx.capsuleClient.touchSession(regenerate);

    this.setSupportedWalletTypes(res.data.supportedWalletTypes, res.data.cosmosPrefix);

    return res;
  }

  private setSupportedWalletTypes(supportedWalletTypes?: SupportedWalletTypes, cosmosPrefix?: string): void {
    if (supportedWalletTypes && !this.#supportedWalletTypes) {
      this.#supportedWalletTypes = supportedWalletTypes;

      Object.keys(this.currentWalletIds).forEach((type: WalletType) => {
        if (!this.#supportedWalletTypes?.some(({ type: supportedType }) => supportedType === type)) {
          delete this.currentWalletIds[type];
        }
      });
    }

    if (cosmosPrefix && !this.cosmosPrefix) {
      this.cosmosPrefix = cosmosPrefix;
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

    const _currentWalletIds = await this.localStorageGetItem(LOCAL_STORAGE_CURRENT_WALLET_IDS);
    const currentWalletIds = _currentWalletIds ? JSON.parse(_currentWalletIds) : undefined;
    this.currentWalletIds = currentWalletIds;

    const stringExternalWallets = await this.localStorageGetItem(LOCAL_STORAGE_EXTERNAL_WALLETS);
    this.externalWallets = JSON.parse(stringExternalWallets || '{}');

    const _currentExternalWalletAddresses = await this.localStorageGetItem(LOCAL_STORAGE_CURRENT_EXTERNAL_WALLET_ADDRESSES);
    const currentExternalWalletAddresses = _currentExternalWalletAddresses
      ? JSON.parse(_currentExternalWalletAddresses)
      : undefined;
    this.currentExternalWalletAddresses = currentExternalWalletAddresses;

    const loginEncryptionKey = await this.sessionStorageGetItem(SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR);
    if (loginEncryptionKey && loginEncryptionKey !== 'undefined') {
      this.loginEncryptionKeyPair = this.convertEncryptionKeyPair(JSON.parse(loginEncryptionKey));
    }

    await this.touchSession();
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
   * Sets the external wallet address and type associated with the `CoreCapsule` instance.
   * @param externalAddress - External wallet address to set.
   * @param externalType - Type of external wallet to set.
   */
  async setExternalWallet(
    externalAddress: string,
    externalType: ExternalWalletType,
    externalWalletProvider?: string,
  ): Promise<void> {
    // Can change this to continue storing existing external wallets if/when we want to allow multiple connected external wallets
    this.externalWallets = {
      [externalAddress]: {
        id: externalAddress,
        address: externalAddress,
        type: externalType,
        name: externalWalletProvider,
        isExternal: true,
        signer: '',
      },
    };
    this.currentExternalWalletAddresses = [externalAddress];
    this.setCurrentExternalWalletAddresses(this.currentExternalWalletAddresses);
    this.setExternalWallets(this.externalWallets);
    typeof window !== 'undefined' && window.dispatchEvent(new Event(EXTERNAL_WALLET_CHANGE_EVENT));
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
   * Sets the external wallets associated with the `CoreCapsule` instance.
   * @param externalWallets - External wallets to set.
   */
  async setExternalWallets(externalWallets: Record<string, Wallet>): Promise<void> {
    this.externalWallets = externalWallets;
    await this.localStorageSetItem(LOCAL_STORAGE_EXTERNAL_WALLETS, JSON.stringify(externalWallets));
  }

  async setCurrentExternalWalletAddresses(currentExternalWalletAddresses: string[]): Promise<void> {
    this.currentExternalWalletAddresses = currentExternalWalletAddresses;

    await this.localStorageSetItem(
      LOCAL_STORAGE_CURRENT_EXTERNAL_WALLET_ADDRESSES,
      JSON.stringify(currentExternalWalletAddresses),
    );
  }

  /**
   * Sets the login encryption key pair associated with the `CoreCapsule` instance.
   * @param keyPair - Encryption key pair generated from loginEncryptionKey.
   */
  async setLoginEncryptionKeyPair(keyPair?: pkiType.rsa.KeyPair): Promise<void> {
    if (!keyPair) {
      keyPair = await getAsymmetricKeyPair(this.ctx);
    }

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
   * Gets the phone object associated with the `CoreCapsule` instance.
   * @returns - phone object with phone number and country code associated with the `CoreCapsule` instance.
   */
  getPhone(): { phone?: string; countryCode?: string } {
    return { phone: this.phone, countryCode: this.countryCode };
  }

  /**
   * Gets the formatted phone number associated with the `CoreCapsule` instance.
   * @returns - formatted phone number associated with the `CoreCapsule` instance.
   */
  getPhoneNumber(): string | undefined {
    if (!this.phone || !this.countryCode) {
      return undefined;
    }
    return normalizePhoneNumber(this.countryCode, this.phone);
  }

  async setCurrentWalletIds(
    currentWalletIds: CurrentWalletIds,
    sessionLookupId?: string,
    needsWallet = false,
  ): Promise<void> {
    this.currentWalletIds = currentWalletIds;

    await this.localStorageSetItem(LOCAL_STORAGE_CURRENT_WALLET_IDS, JSON.stringify(currentWalletIds));
    if (sessionLookupId) {
      await this.ctx.capsuleClient.setCurrentWalletIds(
        this.getUserId(),
        this.currentWalletIds,
        needsWallet,
        sessionLookupId,
      );
    }
    typeof window !== 'undefined' && window.dispatchEvent(new Event(CURRENT_WALLET_IDS_CHANGE_EVENT));
  }

  /**
   * The prefix for the instance's managed Cosmos wallets. Defaults to `'cosmos'`.
   */
  cosmosPrefix?: string;

  /**
   * Validates that a wallet ID is present on the instance, usable, and matches the desired filters.
   * If no ID is passed, this will instead return the first valid, usable wallet ID that matches the filters.
   * @param {string} [walletId] the wallet ID to validate.
   * @param {WalletFilters} [filter={}] a `WalletFilters` object specifying allowed types, schemes, and whether to forbid unclaimed pregen wallets.
   * @returns {string} the wallet ID originally passed, or the one found.
   */
  findWalletId(walletId?: string, filter: WalletFilters = {}): string {
    if (walletId) {
      this.assertIsValidWalletId(walletId, filter);
    } else {
      for (const id of [...this.currentWalletIdsUnique, ...Object.keys(this.wallets)]) {
        if (this.isWalletUsable(id, filter)) {
          walletId = id;
          break;
        }
      }

      if (!walletId) {
        throw new Error(`no valid wallet id found`);
      }
    }

    return walletId;
  }

  /**
   * Retrieves a wallet with the given address, if present.
   * If no ID is passed, this will instead return the first valid, usable wallet ID that matches the filters.
   * @param {string} [walletId] the wallet ID to validate.
   * @param {WalletFilters} [filter={}] a `WalletFilters` object specifying allowed types, schemes, and whether to forbid unclaimed pregen wallets.
   * @returns {string} the wallet ID originally passed, or the one found.
   */
  findWalletByAddress(address: string, filter?: WalletFilters | undefined) {
    if (this.externalWallets[address]) {
      return this.externalWallets[address];
    }

    let wallet;

    Object.entries(this.currentWalletIds).forEach(([type, ids]) => {
      const pregenIds = Object.keys(this.wallets).filter(
        id => this.wallets[id].type === type && this.isPregenWalletClaimable(this.wallets[id]),
      );
      [...ids, ...pregenIds].forEach(id => {
        if (address.toLowerCase() === this.getDisplayAddress(id, { addressType: <WalletType>type }).toLowerCase()) {
          wallet = this.wallets[id];
        }
      });
    });

    if (!wallet) {
      throw new Error(`wallet with address ${address} not found`);
    }

    this.assertIsValidWalletId(wallet.id, filter);

    return wallet;
  }

  findWallet(
    idOrAddress?: string,
    overrideType?: WalletTypeProp,
    filter: WalletFilters = {},
  ): Omit<Wallet, 'signer'> | undefined {
    if (!idOrAddress && Object.keys(this.externalWallets).length > 0) {
      return Object.values(this.externalWallets)[0];
    }

    if (this.externalWallets[idOrAddress]) {
      return this.externalWallets[idOrAddress];
    }

    try {
      const walletId = this.findWalletId(idOrAddress, filter);

      if (walletId && !!this.wallets[walletId]) {
        const { signer: _signer, ...wallet } = this.wallets[walletId];
        const type = overrideType ?? this.currentWalletIdsArray.find(([id]) => id === walletId)?.[1] ?? wallet.type;

        return {
          ...wallet,
          type: WalletType[type],
        };
      }
    } catch (e) {
      return undefined;
    }
  }

  get availableWallets(): Pick<Wallet, 'id' | 'type' | 'name' | 'address' | 'isExternal'>[] {
    return [
      ...this.currentWalletIdsArray
        .map(([address, type]): [string, WalletType, boolean] => [address, type, false])
        .map(([id, type]) => {
          const wallet = this.findWallet(id, type);

          if (!wallet) return null;

          return {
            id: wallet.id,
            type,
            address: this.getDisplayAddress(id, { addressType: type }),
            name: wallet.name,
          };
        })
        .filter(obj => obj !== null),
      ...Object.values(this.externalWallets ?? {}),
    ];
  }

  /**
   * Retrieves all usable wallets with the provided type (`'EVM' | 'COSMOS' | 'SOLANA'`)
   * @param {string} type the wallet type to filter by.
   * @returns {Wallet[]} an array of matching wallets.
   */
  getWalletsByType(type: WalletTypeProp): Wallet[] {
    return Object.values(this.wallets).filter(w => this.isWalletUsable(w.id, { type: [type] }));
  }

  private assertIsValidWalletId(walletId: string, condition: WalletFilters = {}): void {
    this.isWalletUsable(walletId, condition, true);
  }

  private async assertIsValidWalletType(type: string, walletTypes?: WalletType[]): Promise<WalletType> {
    if (!this.#supportedWalletTypes) {
      await this.touchSession();
    }

    if (
      !type ||
      !Object.values(WalletType).includes(<WalletType>type) ||
      !(walletTypes ?? this.supportedWalletTypes.map(({ type }) => type)).includes(<WalletType>type)
    ) {
      throw new Error(`wallet type ${type} is not supported`);
    }

    return <WalletType>type;
  }

  private async getMissingTypes(): Promise<WalletType[]> {
    if (!this.#supportedWalletTypes) {
      await this.touchSession();
    }

    return <WalletType[]>(
      this.supportedWalletTypes
        .filter(
          ({ type: t, optional }) => !optional && Object.values(this.wallets).every(w => !WalletSchemeTypeMap[w.scheme][t]),
        )
        .map(({ type }) => type)
    );
  }

  private async getTypesToCreate(types?: WalletType[]): Promise<WalletType[]> {
    if (!this.#supportedWalletTypes) {
      await this.touchSession();
    }

    return getSchemes(types ?? (await this.getMissingTypes())).map(scheme => {
      switch (scheme) {
        case WalletScheme.ED25519:
          return WalletType.SOLANA;
        default:
          return this.supportedWalletTypes.some(({ type, optional }) => type === WalletType.COSMOS && !optional)
            ? WalletType.COSMOS
            : WalletType.EVM;
      }
    });
  }

  private async getPartnerURL(partnerId: string): Promise<string | undefined> {
    const res = await this.ctx.capsuleClient.getPartner(partnerId);
    return res.data.partner.portalUrl;
  }

  /**
   * URL of the portal, which can be associated with a partner id
   * @param partnerId: string - id of the partner to get the portal URL for
   * @returns - portal URL
   */
  async getPortalURL(partnerId?: string): Promise<string> {
    return (partnerId && (await this.getPartnerURL(partnerId))) || getPortalBaseURL(this.ctx);
  }

  private async getCommonLoginQueryParams(
    partnerId?: string,
    newDeviceSessionId?: string,
    newDeviceEncryptionKey?: string,
  ): Promise<string> {
    return toQueryString({
      newDeviceSessionId,
      newDeviceEncryptionKey,
      pregenWalletIds: Object.entries(this.wallets)
        .filter(([_, wallet]) => this.isPregenWalletClaimable(wallet) && wallet.partnerId === partnerId)
        .map(([id]) => id)
        .join(','),
    });
  }

  private async getCommonQueryParams(partnerId?: string, isForNewDevice?: boolean): Promise<string> {
    const partner: PartnerEntity = partnerId
      ? (await this.ctx.capsuleClient.getPartner(partnerId)).data?.partner
      : undefined;

    return toQueryString({
      apiKey: this.ctx.apiKey,
      partnerId,
      portalFont: partner?.font,
      portalBorderRadius: this.portalTheme?.borderRadius,
      portalThemeMode: partner?.themeMode || this.portalTheme?.mode,
      portalAccentColor: partner?.accentColor || this.portalTheme?.accentColor,
      portalForegroundColor: partner?.foregroundColor || this.portalTheme?.foregroundColor,
      portalBackgroundColor: partner?.backgroundColor || this.portalBackgroundColor || this.portalTheme?.backgroundColor,
      portalPrimaryButtonColor: this.portalPrimaryButtonColor,
      portalTextColor: this.portalTextColor,
      portalPrimaryButtonTextColor: this.portalPrimaryButtonTextColor,
      isForNewDevice: isForNewDevice ? isForNewDevice.toString() : undefined,
      supportedWalletTypes: this.#supportedWalletTypesOpt ? JSON.stringify(this.#supportedWalletTypesOpt) : undefined,
    });
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
    const commonLoginQueryParams = await this.getCommonLoginQueryParams(
      partnerId,
      newDeviceSessionId,
      newDeviceEncryptionKey,
    );

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
    const commonLoginQueryParams = await this.getCommonLoginQueryParams(
      partnerId,
      newDeviceSessionId,
      newDeviceEncryptionKey,
    );

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
  async fetchWallets(): Promise<WalletEntity[]> {
    const res = await (this.isPortal()
      ? this.ctx.capsuleClient.getAllWallets(this.userId)
      : this.ctx.capsuleClient.getWallets(this.userId, true));

    return res.data.wallets.filter(wallet => !!wallet.address && this.isWalletSupported(entityToWallet(wallet)));
  }

  private async populateWalletAddresses(): Promise<void> {
    const res = await this.ctx.capsuleClient.getWallets(this.userId, true);
    const wallets = res.data.wallets;
    wallets.forEach(entity => {
      if (this.wallets[entity.id]) {
        this.wallets[entity.id] = {
          ...entityToWallet(entity),
          ...this.wallets[entity.id],
        };
      }
    });
    await this.setWallets(this.wallets);
  }

  private async populatePregenWalletAddresses(
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType,
  ): Promise<void> {
    const res = await this.ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType);
    const wallets = res.wallets;
    wallets.forEach(entity => {
      if (this.wallets[entity.id]) {
        this.wallets[entity.id] = {
          ...entityToWallet(entity),
          ...this.wallets[entity.id],
        };
      }
    });
    await this.setWallets(this.wallets);
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
   * Logs in or creates a new user using an external wallet address.
   * @param externalAddress - external wallet address to use for identification.
   * @param type - type of external wallet to use for identification.
   * @param externalWalletProvider - name of provider for the external wallet.
   */
  async externalWalletLogin(
    externalAddress: string,
    type: ExternalWalletType,
    externalWalletProvider?: string,
  ): Promise<void> {
    this.requireApiKey();
    const { userId } = await this.ctx.capsuleClient.externalWalletLogin({
      externalAddress,
      type,
      externalWalletProvider,
    });
    await this.setExternalWallet(externalAddress, type, externalWalletProvider);
    await this.setUserId(userId);
  }

  /**
   * Returns whether or not the user is connected with an external wallet.
   */
  isUsingExternalWallet(): boolean {
    return !!Object.keys(this.externalWallets).length;
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
    if (this.isUsingExternalWallet()) {
      return true;
    }

    const res = await this.touchSession();

    return !!res.data.isAuthenticated;
  }

  /**
   * Checks if a session is active and a wallet exists.
   *
   * @returns - true if session is active and a wallet exists.
   **/
  async isFullyLoggedIn(): Promise<boolean> {
    if (this.isUsingExternalWallet()) {
      return true;
    }

    const isSessionActive = await this.isSessionActive();

    return (
      isSessionActive &&
      this.currentWalletIdsArray.length > 0 &&
      this.currentWalletIdsArray.reduce((acc, [id]) => acc && !!this.wallets[id], true)
    );
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
    const res = await this.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      await this.setLoginEncryptionKeyPair();
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
    const res = await this.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      await this.setLoginEncryptionKeyPair();
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
  async waitForAccountCreation(): Promise<boolean> {
    await this.touchSession();

    // Remove external wallets if creating an account with Capsule
    this.currentExternalWalletAddresses = undefined;
    this.externalWallets = {};

    this.isAwaitingAccountCreation = true;
    while (this.isAwaitingAccountCreation) {
      try {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));

        if (await this.isSessionActive()) {
          this.isAwaitingAccountCreation = false;
          return true;
        }
      } catch (err) {
        // want to continue polling on error
        console.error(err);
      }
    }

    return false;
  }

  async waitForPasskeyAndCreateWallet(): Promise<{ walletIds: CurrentWalletIds; recoverySecret?: string }> {
    await this.waitForAccountCreation();
    // This function gets pregen wallets by an identifier and partnerId
    let pregenIdentifier: string;
    let pregenIdentifierType: PregenIdentifierType;
    if (this.email != null) {
      pregenIdentifier = this.email;
      pregenIdentifierType = PregenIdentifierType.EMAIL;
    } else {
      pregenIdentifier = this.getPhoneNumber();
      pregenIdentifierType = PregenIdentifierType.PHONE;
    }

    const pregenWallets = (
      await this.ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType)
    ).wallets.filter(w => this.isWalletSupported(entityToWallet(w)));

    let recoverySecret: string | undefined,
      walletIds: CurrentWalletIds = {};

    if (pregenWallets.length > 0) {
      recoverySecret = await this.claimPregenWallets(pregenIdentifier, pregenIdentifierType);
      walletIds = this.supportedWalletTypes.reduce((acc: CurrentWalletIds, { type }) => {
        return {
          ...acc,
          [type]: [pregenWallets.find(w => !!WalletSchemeTypeMap[w.scheme][type])?.id],
        };
      }, {});
    }

    // After claiming any pregen wallets, create wallets for the remaining missing types
    const created = await this.createWalletPerType();
    recoverySecret = recoverySecret ?? created.recoverySecret;
    walletIds = { ...walletIds, ...created.walletIds };

    return { walletIds, recoverySecret };
  }

  async getFarcasterConnectURL(): Promise<string> {
    await this.logout();
    await this.touchSession(true);
    const {
      data: { connect_uri },
    } = await this.ctx.capsuleClient.initializeFarcasterLogin();
    return connect_uri;
  }

  async waitForFarcasterStatus(): Promise<{
    userExists: boolean;
    username: string;
  }> {
    this.isAwaitingFarcaster = true;
    while (this.isAwaitingFarcaster) {
      try {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));

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
        this.isAwaitingFarcaster = false;
      }
    }
  }

  async getOAuthURL(oAuthMethod: OAuthMethod): Promise<string> {
    await this.logout();
    const res = await this.touchSession(true);
    return `${getBaseUrl(this.ctx.env)}auth/${oAuthMethod.toLowerCase()}?sessionLookupId=${encodeURIComponent(res.data.sessionLookupId)}`;
  }

  async waitForOAuth(): Promise<{
    email?: string;
    userExists: boolean;
  }> {
    this.isAwaitingOAuth = true;
    while (this.isAwaitingOAuth) {
      try {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));

        const res = await this.touchSession();
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
    return { userExists: false };
  }

  /**
   * Waits for the session to be active and sets up the user.
   * @returns { needsWallet } - whether a wallet needs to be created
   **/
  async waitForLoginAndSetup(
    loginWindow?: Window,
    skipSessionRefresh?: boolean,
  ): Promise<{ isComplete: boolean; isError?: boolean; needsWallet?: boolean; partnerId?: string }> {
    // Remove external wallets if logging in with Capsule
    this.currentExternalWalletAddresses = undefined;
    this.externalWallets = {};

    this.isAwaitingLogin = true;
    while (this.isAwaitingLogin) {
      try {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));

        if (!(await this.isSessionActive())) {
          if (loginWindow?.closed) {
            return { isComplete: false, isError: true };
          }
          continue;
        }

        const postLoginData = await this.userSetupAfterLogin();

        const needsWallet = postLoginData.data.needsWallet ?? false;

        if (!needsWallet) {
          if (this.currentWalletIdsArray.length === 0) {
            if (loginWindow?.closed) {
              return { isComplete: false, isError: true };
            } else {
              continue;
            }
          }
        }

        const fetchedWallets = await this.fetchWallets();

        const tempSharesRes = await this.getTransmissionKeyShares();
        // need this check for the case where user has logged in but temp encrypted shares
        // haven't been sent to the backend yet
        if (tempSharesRes.data.temporaryShares.length === fetchedWallets.length) {
          await this.setupAfterLogin(tempSharesRes.data.temporaryShares, skipSessionRefresh);

          const pregenIds = Object.values(this.wallets).reduce((acc, wallet) => {
            if (this.isPregenWalletClaimable(wallet)) {
              acc[wallet.pregenIdentifier] = wallet.pregenIdentifierType;
            }
            return acc;
          }, {});

          for (const [pregenIdentifier, pregenIdentifierType] of Object.entries(pregenIds)) {
            await this.claimPregenWallets(pregenIdentifier, <PregenIdentifierType>pregenIdentifierType);
          }

          return {
            isComplete: true,
            needsWallet: needsWallet || Object.values(this.wallets).length === 0,
            partnerId: postLoginData.data.partnerId,
          };
        }
      } catch (err) {
        // want to continue polling on error
        console.error(err);
      }
    }
    return { isComplete: false };
  }

  /**
   * Updates the session with the user management server, possibly
   * opening a popup to refresh the session.
   *
   * @param shouldOpenPopup - true if you want to open the popup automatically
   * @returns - web auth url for refreshing session
   **/
  async refreshSession(shouldOpenPopup: boolean): Promise<string> {
    const res = await this.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      await this.setLoginEncryptionKeyPair();
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
  async userSetupAfterLogin(): Promise<{ data: { partnerId?: string; needsWallet?: boolean; sessionLookupId: string } }> {
    const res = await this.touchSession();
    await this.setUserId(res.data.userId);

    if (res.data.currentWalletIds && res.data.currentWalletIds !== this.currentWalletIds)
      await this.setCurrentWalletIds(res.data.currentWalletIds, this.isPortal() ? res.data.sessionLookupId : undefined);

    return res;
  }

  /**
   * Get transmission shares associated with session.
   *
   * @param isForNewDevice - true if this device is registering.
   * @returns - transmission keyshares.
   **/
  async getTransmissionKeyShares(isForNewDevice?: boolean): Promise<any> {
    const res = await this.touchSession();
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

    temporaryShares.forEach(share => {
      const signer = decryptWithPrivateKey(this.loginEncryptionKeyPair.privateKey, share.encryptedShare, share.encryptedKey);
      this.wallets[share.walletId] = {
        id: share.walletId,
        signer,
      };
    });

    await this.deleteLoginEncryptionKeyPair();
    await this.populateWalletAddresses();
    await this.touchSession(!skipSessionRefresh);
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
        const wallet = res.data.wallets.find(w => w.id === walletId);
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

        const wallet = res.wallets.find(w => w.id === walletId);
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
   * Creates several new wallets with the desired types. If no types are provided, this method
   * will create one for each of the non-optional types specified in the instance's `supportedWalletTypes`
   * object that are not already present. This is automatically called upon account creation to ensure that
   * the user has a wallet of each required type.
   *
   * @deprecated alias for `createWalletPerType`
   **/
  createWalletPerMissingType = this.createWalletPerType;

  /**
   * Creates several new wallets with the desired types. If no types are provided, this method
   * will create one for each of the non-optional types specified in the instance's `supportedWalletTypes`
   * object that are not already present. This is automatically called upon account creation to ensure that
   * the user has a wallet of each required type.
   *
   * @param {boolean} [skipDistribute] if `true`, the wallets' recovery share will not be distributed.
   * @param {WalletType[]} [types] the types of wallets to create.
   * @returns the wallets created, their ids, and the recovery secret.
   **/
  async createWalletPerType(
    skipDistribute = false,
    types?: WalletType[],
  ): Promise<{ wallets: Wallet[]; walletIds: CurrentWalletIds; recoverySecret?: string }> {
    const wallets: Wallet[] = [];
    const walletIds: CurrentWalletIds = {};
    let recoverySecret: string;

    for (const type of await this.getTypesToCreate(types)) {
      const [wallet, recoveryShare] = await this.createWallet(type, skipDistribute);
      wallets.push(wallet);

      getEquivalentTypes(type)
        .filter(t => !!this.isWalletTypeEnabled[t])
        .forEach(t => {
          walletIds[t] = [wallet.id];
        });

      if (recoveryShare) {
        recoverySecret = recoveryShare;
      }
    }

    return { wallets, walletIds, recoverySecret };
  }

  async refreshShare({
    walletId,
    share,
    oldPartnerId,
    newPartnerId,
    redistributeBackupEncryptedShares,
  }: {
    walletId: string;
    share: string;
    oldPartnerId?: string;
    newPartnerId?: string;
    redistributeBackupEncryptedShares?: boolean;
    emailProps?: BackupKitEmailProps;
  }): Promise<{ signer: string; recoverySecret?: string }> {
    const { signer } = await this.platformUtils.refresh(
      this.ctx,
      this.retrieveSessionCookie(),
      this.userId,
      walletId,
      share,
      oldPartnerId,
      newPartnerId,
    );
    const recoverySecret = await distributeNewShare(
      this.ctx,
      this.userId,
      walletId,
      signer,
      !redistributeBackupEncryptedShares,
      this.getBackupKitEmailProps(),
      newPartnerId,
    );
    return { signer, recoverySecret };
  }

  /**
   * Creates a new wallet.
   *
   * @param skipDistribute - if true, recovery share will not be distributed.
   * @param [customFunction] - {deprecated} method called when createWallet is done.
   * @returns [wallet, recoveryShare]
   **/
  async createWallet(
    _type?: WalletType,
    skipDistribute = false,
    _customFunction?: (params?: any) => void,
  ): Promise<[Wallet, string | null]> {
    this.requireApiKey();
    const walletType = await this.assertIsValidWalletType(
      _type ?? this.supportedWalletTypes.find(({ optional }) => !optional)?.type,
    );

    let signer: string;
    let wallet: Wallet;
    let keygenRes;

    switch (walletType) {
      case WalletType.SOLANA: {
        keygenRes = await this.platformUtils.ed25519Keygen(
          this.ctx,
          this.userId,
          this.retrieveSessionCookie(),
          this.getBackupKitEmailProps(),
        );
        break;
      }
      default: {
        keygenRes = await this.platformUtils.keygen(
          this.ctx,
          this.userId,
          walletType,
          null,
          this.retrieveSessionCookie(),
          this.getBackupKitEmailProps(),
        );
        break;
      }
    }

    const walletId = keygenRes.walletId;
    signer = keygenRes.signer;

    this.wallets[walletId] = {
      id: walletId,
      signer,
    };
    wallet = this.wallets[walletId];

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
    _type: WalletType = this.supportedWalletTypes.find(({ optional }) => !optional)?.type,
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType = PregenIdentifierType.EMAIL,
  ): Promise<Wallet> {
    this.requireApiKey();
    const walletType = await this.assertIsValidWalletType(
      _type ?? this.supportedWalletTypes.find(({ optional }) => !optional)?.type,
    );

    let keygenRes;
    switch (walletType) {
      case WalletType.SOLANA:
        keygenRes = await this.platformUtils.ed25519PreKeygen(
          this.ctx,
          pregenIdentifier,
          pregenIdentifierType,
          this.retrieveSessionCookie(),
        );
        break;
      default:
        keygenRes = await this.platformUtils.preKeygen(
          this.ctx,
          undefined,
          pregenIdentifier,
          pregenIdentifierType,
          walletType,
          null,
          this.retrieveSessionCookie(),
        );
        break;
    }

    const { signer, walletId } = keygenRes;

    this.wallets[walletId] = {
      id: walletId,
      signer,
    };

    await this.waitForPregenWalletAddress(pregenIdentifier, pregenIdentifierType, walletId);
    await this.populatePregenWalletAddresses(pregenIdentifier, pregenIdentifierType);

    return this.wallets[walletId];
  }

  /**
   * Creates new pregenerated wallets for each desired type.
   * If no types are provided, this method will create one for each of the non-optional types
   * specified in the instance's `supportedWalletTypes` array that are not already present.
   *
   * @param {string} pregenIdentifier the identifier to associate each wallet with.
   * @param {PregenIdentifierType} pregenIdentifierType - either `'EMAIL'` or `'PHONE'`.
   * @param {WalletType[]} [types] the wallet types to create. Defaults to any types the instance supports that are not already present.
   * @returns an array containing the created wallets.
   **/
  async createPregenWalletPerType(
    pregenIdentifier: string,
    pregenIdentifierType: PregenIdentifierType = PregenIdentifierType.EMAIL,
    types?: WalletType[],
  ): Promise<Wallet[]> {
    const wallets = [];
    for (const type of await this.getTypesToCreate(types)) {
      const wallet = await this.createWalletPreGen(type, pregenIdentifier, pregenIdentifierType);

      wallets.push(wallet);
    }
    return wallets;
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
    const pregenWallets = (
      await this.ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType)
    ).wallets.filter(w => this.isWalletSupported(entityToWallet(w)));
    if (pregenWallets.length === 0) {
      throw new Error('wallets not found');
    }

    let newRecoverySecret: string | undefined;
    for (const wallet of pregenWallets) {
      await this.ctx.capsuleClient.claimPregenWallet({ userId: this.userId, walletId: wallet.id });
      const { signer: newSigner, recoverySecret } = await this.refreshShare({
        walletId: wallet.id,
        share: this.wallets[wallet.id].signer,
        oldPartnerId: wallet.partnerId,
        newPartnerId: wallet.partnerId,
        redistributeBackupEncryptedShares: true,
      });
      if (recoverySecret) {
        newRecoverySecret = recoverySecret;
      }

      this.wallets[wallet.id] = {
        ...this.wallets[wallet.id],
        signer: newSigner,
        userId: this.userId,
        pregenIdentifier: undefined,
        pregenIdentifierType: undefined,
      };

      await this.setWallets(this.wallets);
    }

    return newRecoverySecret;
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
    walletId: string,
    newType: PregenIdentifierType = PregenIdentifierType.EMAIL,
  ): Promise<void> {
    this.requireApiKey();
    await this.ctx.capsuleClient.updatePregenWallet(walletId, {
      pregenIdentifier: newIdentifier,
      pregenIdentifierType: newType,
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

    const res = await this.ctx.capsuleClient.getPregenWallets(pregenIdentifier, pregenIdentifierType, this.isPortal());
    return res.wallets.filter(w => this.isWalletSupported(entityToWallet(w)));
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
    if (Object.values(this.wallets).length === 0) {
      return null;
    }

    return Object.values(this.wallets)
      .map(wallet => this.encodeWalletBase64(wallet))
      .join('-');
  }

  /**
   * Sets a wallet from a base 64 encoded wallet
   *
   * @param base64Wallet
   * @returns Promise<void>
   **/
  async setUserShare(base64Wallets: string | null): Promise<void> {
    if (!base64Wallets) {
      return;
    }

    const base64WalletsSplit = base64Wallets.split('-');
    for (const base64Wallet of base64WalletsSplit) {
      const walletJson = Buffer.from(base64Wallet, 'base64').toString();
      const wallet = JSON.parse(walletJson) as Wallet;

      this.wallets[wallet.id] = wallet;
      await this.setWallets(this.wallets);
    }
  }

  private async getTransactionReviewUrl(transactionId: string, timeoutMs?: number): Promise<string> {
    const res = await this.touchSession();
    const commonQueryParams = await this.getCommonQueryParams(res.data.partnerId);

    return `${getPortalBaseURL(this.ctx)}/web/users/${
      this.userId
    }/transaction-review/${transactionId}?email=${encodeURIComponent(this.email)}${commonQueryParams}${timeoutMs ? `&timeoutMs=${timeoutMs}` : ''}`;
  }

  private async getOnRampTransactionUrl({
    purchaseId,
    ...walletParams
  }: { purchaseId: string } & WalletParams): Promise<string> {
    const res = await this.ctx.capsuleClient.touchSession();
    const commonQueryParams = await this.getCommonQueryParams(res.data.partnerId);
    const [key, identifier] = extractWalletRef(walletParams);

    const params = qs.stringify(
      {
        [key]: identifier,
        currentWalletIds: JSON.stringify(this.currentWalletIds),
        sessionId: res.data.sessionId,
      },
      { addQueryPrefix: true },
    );

    return `${getPortalBaseURL(this.ctx)}/web/users/${this.userId}/on-ramp-transaction/${purchaseId}${params}${commonQueryParams}`;
  }

  /**
   * Signs a message.
   *
   * If you want to sign the keccak256 hash of a message, hash the
   * message first and then pass in the base64 encoded hash.
   * @param walletId - id of the wallet to sign with.
   * @param messageBase64 - base64 encoding of exact message that should be signed
   * @param timeout - optional timeout in milliseconds. If not present, defaults to 30 seconds.
   **/
  async signMessage(
    walletId: string,
    messageBase64: string,
    timeoutMs: number = 30000,
    cosmosSignDocBase64?: string,
  ): Promise<FullSignatureRes> {
    this.assertIsValidWalletId(walletId);

    const wallet = this.wallets[walletId];
    let signerId: string = this.userId;
    if (wallet.partnerId && !wallet.userId) {
      signerId = wallet.partnerId;
    }

    let signRes = await this.signMessageInner(wallet, signerId, messageBase64, cosmosSignDocBase64);
    let timeStart = Date.now();
    if ((signRes as DeniedSignatureRes).pendingTransactionId) {
      this.platformUtils.openPopup(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId, timeoutMs),
        { type: cosmosSignDocBase64 ? PopupType.SIGN_TRANSACTION_REVIEW : PopupType.SIGN_MESSAGE_REVIEW },
      );
    } else {
      return signRes as SuccessfulSignatureRes;
    }

    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    while (true) {
      if (Date.now() - timeStart > timeoutMs) {
        break;
      }

      try {
        await this.ctx.capsuleClient.getPendingTransaction(this.userId, signRes.pendingTransactionId);
      } catch (err) {
        throw new TransactionReviewDenied();
      }

      signRes = await this.signMessageInner(wallet, signerId, messageBase64, cosmosSignDocBase64);

      if ((signRes as DeniedSignatureRes).pendingTransactionId) {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
      } else {
        break;
      }
    }

    if ((signRes as DeniedSignatureRes).pendingTransactionId) {
      throw new TransactionReviewTimeout(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId),
        (signRes as DeniedSignatureRes).pendingTransactionId,
      );
    }

    return signRes as SuccessfulSignatureRes;
  }

  private async signMessageInner(wallet: Wallet, signerId: string, messageBase64: string, cosmosSignDocBase64?: string) {
    let signRes;

    switch (wallet.scheme) {
      case WalletScheme.ED25519:
        signRes = await this.platformUtils.ed25519Sign(
          this.ctx,
          signerId,
          wallet.id,
          wallet.signer,
          messageBase64,
          this.retrieveSessionCookie(),
        );
        break;
      default:
        signRes = await this.platformUtils.signMessage(
          this.ctx,
          signerId,
          wallet.id,
          wallet.signer,
          messageBase64,
          this.retrieveSessionCookie(),
          wallet.scheme === WalletScheme.DKLS,
          cosmosSignDocBase64,
        );
        break;
    }

    return signRes;
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
    timeoutMs: number = 30000,
  ): Promise<FullSignatureRes> {
    this.assertIsValidWalletId(walletId);

    const wallet = this.wallets[walletId];
    let signerId: string = this.userId;
    if (wallet.partnerId && !wallet.userId) {
      signerId = wallet.partnerId;
    }
    let signRes = await this.platformUtils.signTransaction(
      this.ctx,
      signerId,
      walletId,
      this.wallets[walletId].signer,
      rlpEncodedTxBase64,
      chainId,
      this.retrieveSessionCookie(),
      wallet.scheme === WalletScheme.DKLS,
    );

    let timeStart = Date.now();
    if ((signRes as DeniedSignatureRes).pendingTransactionId) {
      this.platformUtils.openPopup(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId, timeoutMs),
        { type: PopupType.SIGN_TRANSACTION_REVIEW },
      );
    } else {
      return signRes as SuccessfulSignatureRes;
    }

    await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    while (true) {
      if (Date.now() - timeStart > timeoutMs) {
        break;
      }

      try {
        await this.ctx.capsuleClient.getPendingTransaction(
          this.userId,
          (signRes as DeniedSignatureRes).pendingTransactionId,
        );
      } catch (err) {
        throw new TransactionReviewDenied();
      }

      signRes = await this.platformUtils.signTransaction(
        this.ctx,
        signerId,
        walletId,
        this.wallets[walletId].signer,
        rlpEncodedTxBase64,
        chainId,
        this.retrieveSessionCookie(),
        wallet.scheme === WalletScheme.DKLS,
      );

      if ((signRes as DeniedSignatureRes).pendingTransactionId) {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
      } else {
        break;
      }
    }

    if ((signRes as DeniedSignatureRes).pendingTransactionId) {
      throw new TransactionReviewTimeout(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId),
        (signRes as DeniedSignatureRes).pendingTransactionId,
      );
    }

    return signRes as SuccessfulSignatureRes;
  }

  /**
   * Sends a transaction.
   * @param walletId - id of the wallet to send the transaction from.
   * @param rlpEncodedTxBase64 - rlp encoded tx as base64 string
   * @param chainId - chain id of the chain the transaction is being sent on.
   **/
  async sendTransaction(walletId: string, rlpEncodedTxBase64: string, chainId: string): Promise<FullSignatureRes> {
    this.assertIsValidWalletId(walletId);

    const wallet = this.wallets[walletId];
    const signRes = await this.platformUtils.sendTransaction(
      this.ctx,
      this.userId,
      walletId,
      this.wallets[walletId].signer,
      rlpEncodedTxBase64,
      chainId,
      this.retrieveSessionCookie(),
      wallet.scheme === WalletScheme.DKLS,
    );

    if ((signRes as DeniedSignatureRes).pendingTransactionId) {
      this.platformUtils.openPopup(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId),
        { type: PopupType.SIGN_TRANSACTION_REVIEW },
      );

      throw new TransactionReviewError(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId),
      );
    }

    return signRes as SuccessfulSignatureRes;
  }

  isProviderModalDisabled(): boolean {
    return !!this.disableProviderModal;
  }

  /**
   * Starts a on-ramp or off-ramp transaction and returns the Capsule Portal link for the user to finalize and complete it.
   * @param {Object} options - the options for the transaction.
   * @param {OnRampPurchaseCreateParams} options.params - the transaction settings.
   * @param {boolean} options.shouldOpenPopup - if `true`, a popup window with the link will be opened.
   * @param {string} options.walletId - the wallet ID to use for the transaction, where funds will be sent or withdrawn.
   * @param {string} options.externalWalletAddress - the external wallet address to send funds to or withdraw funds from, if using an external wallet.
   **/
  async initiateOnRampTransaction(
    options: WalletParams & { params: OnRampPurchaseCreateParams; shouldOpenPopup?: boolean },
  ): Promise<{
    onRampPurchase: OnRampPurchase;
    portalUrl: string;
  }> {
    const { params, shouldOpenPopup, ...walletParams } = options;

    const onRampPurchase = await this.ctx.capsuleClient.createOnRampPurchase({
      userId: this.userId,
      params: {
        ...params,
        address:
          walletParams.externalWalletAddress ??
          this.getDisplayAddress(walletParams.walletId, { addressType: params.walletType }),
      },
      ...walletParams,
    });

    const portalUrl = await this.getOnRampTransactionUrl({ purchaseId: onRampPurchase.id, ...walletParams });

    if (shouldOpenPopup) {
      this.platformUtils.openPopup(portalUrl, { type: PopupType.ON_RAMP_TRANSACTION });
    }

    return { onRampPurchase, portalUrl };
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
      currentWalletIds: this.currentWalletIds,
      sessionCookie: this.sessionCookie,
      phone: this.phone,
      countryCode: this.countryCode,
    };
    return Buffer.from(JSON.stringify(sessionInfo)).toString('base64');
  }

  async importSession(serializedInstanceBase64: string): Promise<void> {
    const serializedInstance = Buffer.from(serializedInstanceBase64, 'base64').toString('utf8');
    const sessionInfo = JSON.parse(serializedInstance);
    await this.setEmail(sessionInfo.email);
    await this.setUserId(sessionInfo.userId);
    await this.setWallets(sessionInfo.wallets);
    for (const walletId of Object.keys(this.wallets)) {
      if (!this.wallets[walletId].userId) {
        this.wallets[walletId].userId = this.userId;
      }
    }
    await this.setCurrentWalletIds(sessionInfo.currentWalletIds);
    this.persistSessionCookie(sessionInfo.sessionCookie);
    await this.setPhoneNumber(sessionInfo.phone, sessionInfo.countryCode);
  }

  exitAccountCreation() {
    this.isAwaitingAccountCreation = false;
  }

  exitLogin() {
    this.isAwaitingLogin = false;
  }

  exitFarcaster() {
    this.isAwaitingFarcaster = false;
  }

  exitOAuth() {
    this.isAwaitingOAuth = false;
  }

  exitLoops() {
    this.exitAccountCreation();
    this.exitLogin();
    this.exitFarcaster();
    this.exitOAuth();
  }

  /**
   * Logs the user out.
   *
   * @param preservePregenWallets - preserves the stored pregen wallets in memory after the logout.
   **/
  async logout(preservePregenWallets?: boolean): Promise<void> {
    await this.ctx.capsuleClient.logout();
    await this.clearStorage();

    if (preservePregenWallets) {
      Object.entries(this.wallets).forEach(([id, wallet]) => {
        if (!wallet.pregenIdentifier) {
          delete this.wallets[id];
        }
      });
      await this.setWallets(this.wallets);
    } else {
      this.wallets = {};
    }
    this.currentWalletIds = {};
    this.currentExternalWalletAddresses = undefined;
    this.externalWallets = {};
    this.loginEncryptionKeyPair = undefined;
    this.email = undefined;
    this.phone = undefined;
    this.countryCode = undefined;
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
          ...this.wallets[walletId],
          signer: this.wallets[walletId].signer ? '[REDACTED]' : undefined,
        },
      }),
      {},
    );
    const obj = {
      supportedWalletTypes: this.supportedWalletTypes,
      cosmosPrefix: this.cosmosPrefix,
      email: this.email,
      phone: this.phone,
      countryCode: this.countryCode,
      userId: this.userId,
      currentWalletIds: this.currentWalletIds,
      wallets: redactedWallets,
      loginEncryptionKeyPair: this.loginEncryptionKeyPair ? '[REDACTED]' : undefined,
      ctx: {
        apiKey: this.ctx.apiKey,
        disableWorkers: this.ctx.disableWorkers,
        disableWebSockets: this.ctx.disableWebSockets,
        env: this.ctx.env,
        offloadMPCComputationURL: this.ctx.offloadMPCComputationURL,
        useLocalFiles: this.ctx.useLocalFiles,
        useDKLS: this.ctx.useDKLS,
        cosmosPrefix: this.ctx.cosmosPrefix,
      },
    };

    return `Capsule ${JSON.stringify(obj, null, 2)}`;
  }
}
