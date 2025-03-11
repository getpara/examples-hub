import { Buffer as NodeBuffer } from 'buffer';
if (typeof global !== 'undefined') {
  global.Buffer = global.Buffer || NodeBuffer;
} else if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || NodeBuffer;
  window.global = window.global || window;
} else {
  self.Buffer = self.Buffer || NodeBuffer;
  self.global = self.global || self;
}

import Client, {
  AuthMethod,
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
  OAuthMethod,
  OnRampPurchaseCreateParams,
  OnRampPurchase,
  TPregenIdentifierType,
  PregenIds,
  extractWalletRef,
  PasswordStatus,
  BiometricLocationHint,
  TelegramAuthResponse,
  VerifyTelegramRes,
  Auth,
  extractAuthInfo,
  ExtractAuth,
  ExternalWalletLoginRes,
} from '@getpara/user-management-client';
import type { pki as pkiType, jsbn as jsbnType } from 'node-forge';
import forge from 'node-forge';
const { pki, jsbn } = forge;

import { decryptWithPrivateKey, getAsymmetricKeyPair, getPublicKeyHex } from './cryptography/utils.js';
import { getBaseOAuthUrl, initClient } from './external/userManagementClient.js';
import * as mpcComputationClient from './external/mpcComputationClient.js';
import { distributeNewShare } from './shares/shareDistribution.js';
import {
  Ctx,
  Environment,
  Theme,
  FullSignatureRes,
  SuccessfulSignatureRes,
  DeniedSignatureRes,
  PopupType,
  ExternalWalletInfo,
  GetWebAuthUrlForLoginParams,
  ParaEvent,
  AccountSetupResponse,
  LoginResponse,
  WalletCreatedResponse,
  PregenWalletClaimedResponse,
  WalletFilters,
  WalletTypeProp,
  Wallet,
  SupportedWalletTypes,
  deprecated__SupportedWalletTypesOpt,
  PortalUrlOptions,
  ConstructorOpts,
  RecoveryStatus,
} from './types/index.js';
import * as transmissionUtils from './transmission/transmissionUtils.js';
import { PlatformUtils } from './PlatformUtils.js';
import { sendRecoveryForShare } from './shares/recovery.js';
import { CountryCallingCode } from 'libphonenumber-js';
import {
  constructUrl,
  dispatchEvent,
  entityToWallet,
  getCosmosAddress,
  getEquivalentTypes,
  getParaConnectBaseUrl,
  getPortalBaseURL,
  getSchemes,
  isPregenIdentifierMatch,
  isWalletSupported,
  migrateWallet,
  normalizePhoneNumber,
  truncateAddress,
  WalletSchemeTypeMap,
} from './utils/index.js';
import { TransactionReviewDenied, TransactionReviewError, TransactionReviewTimeout } from './errors.js';
import * as constants from './constants.js';
import { setupListeners } from './utils/listeners.js';
import { autoBind } from './utils/autobind.js';

export abstract class ParaCore {
  static version?: string = constants.PARA_CORE_VERSION;

  ctx: Ctx;

  email?: string;
  phone?: string;
  countryCode?: CountryCallingCode;
  farcasterUsername?: string;
  telegramUserId?: string;
  userId?: string;
  private sessionCookie?: string;

  private isAwaitingAccountCreation = false;
  private isAwaitingLogin = false;
  private isAwaitingFarcaster = false;
  private isAwaitingOAuth = false;

  get isEmail(): boolean {
    return !!this.email && !this.phone && !this.countryCode && !this.farcasterUsername && !this.telegramUserId;
  }

  get isPhone(): boolean {
    return !!this.phone && !!this.countryCode && !this.email && !this.farcasterUsername && !this.telegramUserId;
  }

  get isFarcaster(): boolean {
    return !!this.farcasterUsername && !this.email && !this.phone && !this.countryCode && !this.telegramUserId;
  }

  get isTelegram(): boolean {
    return !!this.telegramUserId && !this.email && !this.phone && !this.countryCode && !this.farcasterUsername;
  }

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
   * Wallets associated with the `ParaCore` instance. Retrieve a particular wallet using `para.wallets[walletId]`.
   */
  wallets: Record<string, Wallet>;

  /**
   * Wallets associated with the `ParaCore` instance.
   */
  externalWallets: Record<string, Wallet>;

  /**
   * A map of pre-generated wallet identifiers that can be claimed in the current instance.
   */
  get pregenIds(): PregenIds {
    return {
      ...Object.values(this.wallets)
        .filter(wallet => !this.userId || this.isPregenWalletClaimable(wallet))
        .reduce((acc, wallet) => {
          if ((acc[wallet.pregenIdentifierType] ?? []).includes(wallet.pregenIdentifier)) {
            return acc;
          }

          return {
            ...acc,
            [wallet.pregenIdentifierType]: [
              ...new Set([...(acc[wallet.pregenIdentifierType] ?? []), wallet.pregenIdentifier]),
            ],
          };
        }, {}),
    };
  }

  /**
   * Whether the instance has multiple wallets connected.
   */
  get isMultiWallet(): boolean {
    return this.currentWalletIdsArray.length > 1;
  }

  /**
   * Base theme for the emails sent from this Para instance.
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
    (isAll || type === 'local') && this.platformUtils.localStorage.clear(constants.PREFIX);
    (isAll || type === 'session') && this.platformUtils.sessionStorage.clear(constants.PREFIX);
    if ((isAll || type === 'secure') && this.platformUtils.secureStorage) {
      this.platformUtils.secureStorage.clear(constants.PREFIX);
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

  private isPortal(envOverride?: Environment): boolean {
    if (typeof window === 'undefined') return false;
    return (
      !!window.location?.host &&
      getPortalBaseURL(envOverride ? { env: envOverride } : this.ctx).includes(window.location.host)
    );
  }

  private isParaConnect(): boolean {
    if (typeof window === 'undefined') return false;
    return !!window.location?.host && getParaConnectBaseUrl(this.ctx).includes(window.location.host);
  }

  private requireApiKey() {
    if (!this.ctx.apiKey) {
      throw new Error(
        `in order to create a wallet or user with Para, you
        must provide an API key to the Para instance`,
      );
    }
  }

  private isWalletSupported(wallet: Omit<Wallet, 'signer'>): boolean {
    return (
      !this.#supportedWalletTypes || isWalletSupported(this.supportedWalletTypes?.map(({ type }) => type) ?? [], wallet)
    );
  }

  private isWalletOwned(wallet: Wallet): boolean {
    return (
      this.isWalletSupported(wallet) &&
      !wallet?.pregenIdentifier &&
      !wallet?.pregenIdentifierType &&
      !!this.userId &&
      wallet?.userId === this.userId
    );
  }

  private isPregenWalletUnclaimed(wallet: Wallet): boolean {
    return (
      this.isWalletSupported(wallet) &&
      (!wallet?.userId || (wallet?.isPregen && !!wallet?.pregenIdentifier && !!wallet?.pregenIdentifierType))
    );
  }

  private isPregenWalletClaimable(wallet: Wallet): boolean {
    return (
      this.isWalletSupported(wallet) &&
      this.isPregenWalletUnclaimed(wallet) &&
      (!['EMAIL', 'PHONE', 'TELEGRAM'].includes(wallet?.pregenIdentifierType) ||
        isPregenIdentifierMatch(
          wallet?.pregenIdentifierType === 'EMAIL'
            ? this.email
            : wallet?.pregenIdentifierType === 'TELEGRAM'
              ? this.telegramUserId
              : this.getPhoneNumber(),
          wallet?.pregenIdentifier,
          wallet?.pregenIdentifierType,
        ))
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
        error = `pre-generated wallet with id ${wallet?.id} cannot be selected`;
      } else if (!isOwned && !isUnclaimed) {
        error = `wallet with id ${wallet?.id} is not owned by the current user`;
      } else if (!this.isWalletSupported(wallet)) {
        error = `wallet with id ${wallet?.id} and type ${wallet?.type} is not supported, supported types are: ${this.supportedWalletTypes
          .map(({ type }) => type)
          .join(', ')}`;
      } else if (
        types &&
        (!getEquivalentTypes(types).includes(wallet?.type) ||
          (isOwned && !types.some(type => this.currentWalletIds?.[type]?.includes(walletId))))
      ) {
        error = `wallet with id ${wallet?.id} and type ${wallet?.type} cannot be selected`;
      } else if (schemes && !schemes.includes(wallet?.scheme)) {
        error = `wallet with id ${wallet?.id} and scheme ${wallet?.scheme} cannot be selected`;
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
    return walletId ? this.wallets[walletId]?.address : Object.values(this.wallets)?.[0]?.address;
  }

  protected abstract getPlatformUtils(): PlatformUtils;

  private async constructPortalUrl(
    type: 'createAuth' | 'createPassword' | 'loginAuth' | 'loginPassword' | 'txReview' | 'onRamp',
    opts: PortalUrlOptions = {},
  ) {
    const base = type === 'onRamp' ? getPortalBaseURL(this.ctx) : await this.getPortalURL(opts.partnerId);

    let path: string;
    switch (type) {
      case 'createPassword': {
        path = `/web/users/${this.userId}/passwords/${opts.pathId}`;
        break;
      }
      case 'createAuth': {
        path = `/web/users/${this.userId}/biometrics/${opts.pathId}`;
        break;
      }
      case 'loginPassword': {
        path = '/web/passwords/login';
        break;
      }
      case 'loginAuth': {
        path = '/web/biometrics/login';
        break;
      }
      case 'txReview': {
        path = `/web/users/${this.userId}/transaction-review/${opts.pathId}`;
        break;
      }
      case 'onRamp': {
        path = `/web/users/${this.userId}/on-ramp-transaction/${opts.pathId}`;
        break;
      }
      default: {
        throw new Error(`invalid URL type ${type}`);
      }
    }

    const [isCreate, isLogin, isOnRamp] = [
      ['createAuth', 'createPassword'].includes(type),
      ['loginAuth', 'loginPassword'].includes(type),
      type === 'onRamp',
    ];

    const partner: PartnerEntity = opts.partnerId
      ? (await this.ctx.client.getPartner(opts.partnerId)).data?.partner
      : undefined;

    const params: Record<string, string | undefined | null> = {
      apiKey: this.ctx.apiKey,
      partnerId: opts.partnerId,
      portalFont: opts.theme?.font || partner?.font || this.portalTheme?.font,
      portalBorderRadius: opts.theme?.borderRadius || this.portalTheme?.borderRadius,
      portalThemeMode: opts.theme?.mode || partner?.themeMode || this.portalTheme?.mode,
      portalAccentColor: opts.theme?.accentColor || partner?.accentColor || this.portalTheme?.accentColor,
      portalForegroundColor: opts.theme?.foregroundColor || partner?.foregroundColor || this.portalTheme?.foregroundColor,
      portalBackgroundColor:
        opts.theme?.backgroundColor ||
        partner?.backgroundColor ||
        this.portalBackgroundColor ||
        this.portalTheme?.backgroundColor,
      portalPrimaryButtonColor: this.portalPrimaryButtonColor,
      portalTextColor: this.portalTextColor,
      portalPrimaryButtonTextColor: this.portalPrimaryButtonTextColor,
      isForNewDevice: opts.isForNewDevice ? opts.isForNewDevice.toString() : undefined,
      supportedWalletTypes: this.#supportedWalletTypesOpt ? JSON.stringify(this.#supportedWalletTypesOpt) : undefined,
      ...(isCreate || isLogin
        ? {
            ...(opts.authType === 'email' ? { email: this.email } : {}),
            ...(opts.authType === 'phone' ? { phone: this.phone, countryCode: this.countryCode } : {}),
            ...(opts.authType === 'farcaster' ? { farcasterUsername: this.farcasterUsername } : {}),
            ...(opts.authType === 'telegram' ? { telegramUserId: this.telegramUserId } : {}),
          }
        : {}),
      ...(isLogin || isOnRamp ? { sessionId: opts.sessionId } : {}),
      ...(isLogin
        ? {
            encryptionKey: opts.loginEncryptionPublicKey,
            newDeviceSessionLookupId: opts.newDeviceSessionId,
            newDeviceEncryptionKey: opts.newDeviceEncryptionKey,
            pregenIds: JSON.stringify(this.pregenIds),
            displayName: opts.displayName,
            pfpUrl: opts.pfpUrl,
          }
        : {}),
      ...(opts.params || {}),
    };

    return constructUrl({ base, path, params });
  }

  /**
   * Constructs a new `ParaCore` instance.
   * @param env - `Environment` to use.
   * @param apiKey - API key to use.
   * @param opts - Additional constructor options; see `ConstructorOpts`.
   * @returns - A new ParaCore instance.
   */
  constructor(env: Environment, apiKey: string, opts?: ConstructorOpts) {
    if (!apiKey) {
      throw new Error('A Para API key is required.');
    }

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
      (opts.useSessionStorage ? this.sessionStorageSetItem : this.localStorageSetItem)(
        constants.LOCAL_STORAGE_SESSION_COOKIE,
        cookie,
      );
    };

    this.ctx = {
      env,
      apiKey,
      client: initClient({
        env,
        version: ParaCore.version,
        apiKey,
        partnerId: this.isPortal(env) ? opts.portalPartnerId : undefined,
        useFetchAdapter: !!opts.disableWorkers,
        retrieveSessionCookie: this.retrieveSessionCookie,
        persistSessionCookie: this.persistSessionCookie,
      }),
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

    if (!this.platformUtils.isSyncStorage || opts.useStorageOverrides) {
      return;
    }
    this.initializeFromStorage();

    setupListeners.bind(this)();

    // Auto bind all functions to the instance so the instance can be destructured i.e. in the react-sdk
    autoBind(this);
  }

  private initializeFromStorage = () => {
    this.updateEmailFromStorage();
    this.updateCountryCodeFromStorage();
    this.updatePhoneFromStorage();
    this.updateUserIdFromStorage();
    this.updateTelegramUserIdFromStorage();
    this.updateWalletsFromStorage();
    this.updateWalletIdsFromStorage();
    this.updateSessionCookieFromStorage();
    this.updateLoginEncryptionKeyPairFromStorage();
    this.updateExternalWalletsFromStorage();
  };

  private updateTelegramUserIdFromStorage = () => {
    this.telegramUserId = (this.localStorageGetItem(constants.LOCAL_STORAGE_TELEGRAM_USER_ID) as string) || undefined;
  };
  private updateUserIdFromStorage = () => {
    this.userId = (this.localStorageGetItem(constants.LOCAL_STORAGE_USER_ID) as string) || undefined;
  };
  private updatePhoneFromStorage = () => {
    this.phone = (this.localStorageGetItem(constants.LOCAL_STORAGE_PHONE) as string) || undefined;
  };
  private updateCountryCodeFromStorage = () => {
    this.countryCode = (this.localStorageGetItem(constants.LOCAL_STORAGE_COUNTRY_CODE) as CountryCallingCode) || undefined;
  };
  private updateEmailFromStorage = () => {
    this.email = (this.localStorageGetItem(constants.LOCAL_STORAGE_EMAIL) as string) || undefined;
  };
  private updateWalletsFromStorage = async () => {
    // TODO: Improve not great check
    const _currentWalletIds = (this.localStorageGetItem(constants.LOCAL_STORAGE_CURRENT_WALLET_IDS) as string) ?? undefined;
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
    const stringWallets = this.platformUtils.secureStorage
      ? this.platformUtils.secureStorage.get(constants.LOCAL_STORAGE_WALLETS)
      : this.localStorageGetItem(constants.LOCAL_STORAGE_WALLETS);
    const _wallets = JSON.parse((stringWallets as string) || '{}');
    const stringEd25519Wallets = this.platformUtils.secureStorage
      ? this.platformUtils.secureStorage.get(constants.LOCAL_STORAGE_ED25519_WALLETS)
      : this.localStorageGetItem(constants.LOCAL_STORAGE_ED25519_WALLETS);
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
  };
  private updateWalletIdsFromStorage = () => {
    // TODO: Improve not great check
    const _currentWalletIds = (this.localStorageGetItem(constants.LOCAL_STORAGE_CURRENT_WALLET_IDS) as string) ?? undefined;
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

    // In case currentWalletIds was missing from storage
    if (
      Object.values(this.wallets).filter(w => this.isWalletOwned(w)).length > 0 &&
      this.currentWalletIdsArray.length === 0
    ) {
      this.findWalletId(undefined, { forbidPregen: true });
    }
  };
  private updateSessionCookieFromStorage = () => {
    // TODO: remove sessionStorageGetItem call once new version is being consumed
    this.sessionCookie =
      (this.localStorageGetItem(constants.LOCAL_STORAGE_SESSION_COOKIE) as string) ||
      (this.sessionStorageGetItem(constants.LOCAL_STORAGE_SESSION_COOKIE) as string) ||
      undefined;
  };
  private updateLoginEncryptionKeyPairFromStorage = () => {
    const loginEncryptionKey = this.sessionStorageGetItem(constants.SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR) as
      | string
      | null;
    if (loginEncryptionKey && loginEncryptionKey !== 'undefined') {
      this.loginEncryptionKeyPair = this.convertEncryptionKeyPair(JSON.parse(loginEncryptionKey));
    }
  };
  private updateExternalWalletsFromStorage = () => {
    const stringExternalWallets = this.localStorageGetItem(constants.LOCAL_STORAGE_EXTERNAL_WALLETS);
    const _externalWallets = JSON.parse((stringExternalWallets as string) || '{}');

    this.setExternalWallets(_externalWallets);
  };

  async touchSession(regenerate = false): Promise<Awaited<ReturnType<Client['touchSession']>>> {
    const res = await this.ctx.client.touchSession(regenerate);

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
   * Initialize storage relating to a `ParaCore` instance.
   *
   * Init only needs to be called for storage that is async.
   */
  async init(): Promise<void> {
    this.email = ((await this.localStorageGetItem(constants.LOCAL_STORAGE_EMAIL)) as string) || undefined;
    this.countryCode =
      ((await this.localStorageGetItem(constants.LOCAL_STORAGE_COUNTRY_CODE)) as CountryCallingCode) || undefined;
    this.phone = ((await this.localStorageGetItem(constants.LOCAL_STORAGE_PHONE)) as string) || undefined;
    this.userId = ((await this.localStorageGetItem(constants.LOCAL_STORAGE_USER_ID)) as string) || undefined;
    this.telegramUserId =
      ((await this.localStorageGetItem(constants.LOCAL_STORAGE_TELEGRAM_USER_ID)) as string) || undefined;

    const stringWallets = this.platformUtils.secureStorage
      ? await this.platformUtils.secureStorage.get(constants.LOCAL_STORAGE_WALLETS)
      : await this.localStorageGetItem(constants.LOCAL_STORAGE_WALLETS);
    const _wallets = JSON.parse((stringWallets as string) || '{}');
    const stringEd25519Wallets = this.platformUtils.secureStorage
      ? await this.platformUtils.secureStorage.get(constants.LOCAL_STORAGE_ED25519_WALLETS)
      : await this.localStorageGetItem(constants.LOCAL_STORAGE_ED25519_WALLETS);
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

    await this.setWallets(wallets);

    // TODO: Improve not great check
    const _currentWalletIds =
      ((await this.localStorageGetItem(constants.LOCAL_STORAGE_CURRENT_WALLET_IDS)) as string) ?? undefined;
    const currentWalletIds = [undefined, null, 'undefined', 'null'].includes(_currentWalletIds)
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

    await this.setCurrentWalletIds(currentWalletIds);

    // TODO: remove sessionStorageGetItem call once new version is being consumed
    this.sessionCookie =
      ((await this.localStorageGetItem(constants.LOCAL_STORAGE_SESSION_COOKIE)) as string) ||
      ((await this.sessionStorageGetItem(constants.LOCAL_STORAGE_SESSION_COOKIE)) as string) ||
      undefined;

    // In case currentWalletIds was missing from storage
    if (
      Object.values(this.wallets).filter(w => this.isWalletOwned(w)).length > 0 &&
      this.currentWalletIdsArray.length === 0
    ) {
      this.findWalletId(undefined, { forbidPregen: true });
    }

    const loginEncryptionKey = (await this.sessionStorageGetItem(constants.SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR)) as
      | string
      | null;
    if (loginEncryptionKey && loginEncryptionKey !== 'undefined') {
      this.loginEncryptionKeyPair = this.convertEncryptionKeyPair(JSON.parse(loginEncryptionKey));
    }

    const stringExternalWallets = await this.localStorageGetItem(constants.LOCAL_STORAGE_EXTERNAL_WALLETS);
    const _externalWallets = JSON.parse((stringExternalWallets as string) || '{}');

    await this.setExternalWallets(_externalWallets);

    setupListeners.bind(this)();

    await this.touchSession();
  }

  /**
   * Sets the email associated with the `ParaCore` instance.
   * @param email - Email to set.
   */
  async setEmail(email: string): Promise<void> {
    this.email = email;
    await this.localStorageSetItem(constants.LOCAL_STORAGE_EMAIL, email);
  }

  /**
   * Sets the Telegram user ID associated with the `ParaCore` instance.
   * @param telegramUserId - Telegram user ID to set.
   */
  async setTelegramUserId(telegramUserId: string): Promise<void> {
    this.telegramUserId = telegramUserId;
    await this.localStorageSetItem(constants.LOCAL_STORAGE_TELEGRAM_USER_ID, telegramUserId);
  }

  /**
   * Sets the phone number associated with the `ParaCore` instance.
   * @param phone - Phone number to set.
   * @param countryCode - Country Code to set.
   */
  async setPhoneNumber(phone: string, countryCode: CountryCallingCode): Promise<void> {
    this.phone = phone;
    this.countryCode = countryCode;
    await this.localStorageSetItem(constants.LOCAL_STORAGE_PHONE, phone);
    await this.localStorageSetItem(constants.LOCAL_STORAGE_COUNTRY_CODE, countryCode);
  }

  /**
   * Sets the farcaster username associated with the `ParaCore` instance.
   * @param farcasterUsername - Farcaster Username to set.
   */
  async setFarcasterUsername(farcasterUsername: string): Promise<void> {
    this.farcasterUsername = farcasterUsername;
    await this.localStorageSetItem(constants.LOCAL_STORAGE_FARCASTER_USERNAME, farcasterUsername);
  }

  /**
   * Sets the external wallet address and type associated with the `ParaCore` instance.
   * @param externalAddress - External wallet address to set.
   * @param externalType - Type of external wallet to set.
   */
  async setExternalWallet({ address, type, provider, addressBech32 }: ExternalWalletInfo): Promise<void> {
    // Can change this to continue storing existing external wallets if/when we want to allow multiple connected external wallets
    this.externalWallets = {
      [address]: {
        id: address,
        address: addressBech32 ?? address,
        type,
        name: provider,
        isExternal: true,
        signer: '',
      },
    };
    this.setExternalWallets(this.externalWallets);
    dispatchEvent(ParaEvent.EXTERNAL_WALLET_CHANGE_EVENT, null);
  }

  /**
   * Sets the user id associated with the `ParaCore` instance.
   * @param userId - User id to set.
   */
  async setUserId(userId: string): Promise<void> {
    this.userId = userId;
    await this.localStorageSetItem(constants.LOCAL_STORAGE_USER_ID, userId);
  }

  /**
   * Sets the wallets associated with the `ParaCore` instance.
   * @param wallets - Wallets to set.
   */
  async setWallets(wallets: Record<string, Wallet>): Promise<void> {
    this.wallets = wallets;
    if (this.platformUtils.secureStorage) {
      await this.platformUtils.secureStorage.set(constants.LOCAL_STORAGE_WALLETS, JSON.stringify(wallets));
      return;
    }
    await this.localStorageSetItem(constants.LOCAL_STORAGE_WALLETS, JSON.stringify(wallets));
  }

  /**
   * Sets the external wallets associated with the `ParaCore` instance.
   * @param externalWallets - External wallets to set.
   */
  async setExternalWallets(externalWallets: Record<string, Wallet>): Promise<void> {
    this.externalWallets = externalWallets;
    await this.localStorageSetItem(constants.LOCAL_STORAGE_EXTERNAL_WALLETS, JSON.stringify(externalWallets));
  }

  /**
   * Sets the login encryption key pair associated with the `ParaCore` instance.
   * @param keyPair - Encryption key pair generated from loginEncryptionKey.
   */
  protected async setLoginEncryptionKeyPair(keyPair?: pkiType.rsa.KeyPair): Promise<void> {
    if (!keyPair) {
      keyPair = await getAsymmetricKeyPair(this.ctx);
    }

    this.loginEncryptionKeyPair = keyPair;
    await this.sessionStorageSetItem(constants.SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR, JSON.stringify(keyPair));
  }

  private async deleteLoginEncryptionKeyPair(): Promise<void> {
    this.loginEncryptionKeyPair = undefined;
    await this.sessionStorageRemoveItem(constants.SESSION_STORAGE_LOGIN_ENCRYPTION_KEY_PAIR);
  }

  /**
   * Gets the userId associated with the `ParaCore` instance.
   * @returns - userId associated with the `ParaCore` instance.
   */
  getUserId(): string | undefined {
    return this.userId;
  }

  /**
   * Gets the email associated with the `ParaCore` instance.
   * @returns - email associated with the `ParaCore` instance.
   */
  getEmail(): string | undefined {
    return this.email;
  }

  /**
   * Gets the phone object associated with the `ParaCore` instance.
   * @returns - phone object with phone number and country code associated with the `ParaCore` instance.
   */
  getPhone(): { phone?: string; countryCode?: string } {
    return { phone: this.phone, countryCode: this.countryCode };
  }

  /**
   * Gets the formatted phone number associated with the `ParaCore` instance.
   * @returns - formatted phone number associated with the `ParaCore` instance.
   */
  getPhoneNumber(): string | undefined {
    if (!this.phone || !this.countryCode) {
      return undefined;
    }
    return normalizePhoneNumber(this.countryCode, this.phone);
  }

  /**
   * Gets the farcaster username associated with the `ParaCore` instance.
   * @returns - farcaster username associated with the `ParaCore` instance.
   */
  getFarcasterUsername(): string | undefined {
    return this.farcasterUsername;
  }

  async setCurrentWalletIds(
    currentWalletIds: CurrentWalletIds,
    {
      needsWallet = false,
      sessionLookupId,
      newDeviceSessionLookupId,
    }: {
      needsWallet?: boolean;
      sessionLookupId?: string;
      newDeviceSessionLookupId?: string;
    } = {},
  ): Promise<void> {
    this.currentWalletIds = currentWalletIds;

    await this.localStorageSetItem(constants.LOCAL_STORAGE_CURRENT_WALLET_IDS, JSON.stringify(this.currentWalletIds));
    if (sessionLookupId) {
      await this.ctx.client.setCurrentWalletIds(
        this.getUserId(),
        this.currentWalletIds,
        needsWallet,
        sessionLookupId,
        newDeviceSessionLookupId,
      );
    }
    dispatchEvent(ParaEvent.WALLETS_CHANGE_EVENT, null);
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

    Object.entries(this.currentWalletIds).forEach(([type, walletIds]) => {
      const pregenWalletIds = Object.keys(this.wallets).filter(
        id => this.wallets[id].type === type && this.isPregenWalletClaimable(this.wallets[id]),
      );
      [...walletIds, ...pregenWalletIds].forEach(id => {
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
          ({ type: t, optional }) =>
            !optional && Object.values(this.wallets).every(w => !this.isWalletOwned(w) || !WalletSchemeTypeMap[w.scheme][t]),
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
    const res = await this.ctx.client.getPartner(partnerId);
    return res.data.partner.portalUrl;
  }

  /**
   * URL of the portal, which can be associated with a partner id
   * @param partnerId: string - id of the partner to get the portal URL for
   * @returns - portal URL
   */
  protected async getPortalURL(partnerId?: string): Promise<string> {
    return (partnerId && (await this.getPartnerURL(partnerId))) || getPortalBaseURL(this.ctx);
  }

  private async getWebAuthURLForCreate({
    webAuthId,
    ...options
  }: Pick<PortalUrlOptions, 'authType' | 'partnerId' | 'isForNewDevice'> & {
    webAuthId: string;
  }): Promise<string> {
    return this.constructPortalUrl('createAuth', { ...options, pathId: webAuthId });
  }

  private async getPasswordURLForCreate({
    passwordId,
    ...options
  }: Pick<PortalUrlOptions, 'authType' | 'partnerId' | 'isForNewDevice' | 'theme'> & {
    passwordId: string;
  }): Promise<string> {
    return this.constructPortalUrl('createPassword', {
      ...options,
      pathId: passwordId,
    });
  }

  private getShortUrl(compressedUrl: string): string {
    return constructUrl({
      base: getPortalBaseURL(this.ctx),
      path: `/short/${compressedUrl}`,
    });
  }

  async shortenLoginLink(link: string): Promise<string> {
    const url = await transmissionUtils.upload(link, this.ctx.client);
    return this.getShortUrl(url);
  }

  /**
   * Generates a URL for registering a new WebAuth passkey.
   * @param {GetWebAuthUrlForLoginParams} opts the options object
   * @returns - the URL for creating a new passkey
   */
  async getWebAuthURLForLogin(opts: GetWebAuthUrlForLoginParams): Promise<string> {
    return this.constructPortalUrl('loginAuth', opts);
  }

  /**
   * Generates a URL for registering a new user password.
   * @param {GetWebAuthUrlForLoginParams} opts the options object
   * @returns - the URL for creating a new password
   */
  async getPasswordURLForLogin(opts: GetWebAuthUrlForLoginParams): Promise<string> {
    return this.constructPortalUrl('loginPassword', opts);
  }

  /**
   * Generates a URL for registering a new WebAuth passkey for a phone number.
   * @param {Omit<GetWebAuthUrlForLoginParams, 'authType'>} opts the options object
   * @returns - web auth url
   */
  async getWebAuthURLForLoginForPhone(opts: Omit<GetWebAuthUrlForLoginParams, 'authType'>): Promise<string> {
    return this.constructPortalUrl('loginAuth', {
      authType: 'phone',
      ...opts,
    });
  }

  /**
   * Gets the private key for the given wallet.
   * @param {string } [walletId] id of the wallet to get the private key for. Will default to the first wallet if not provided.
   * @returns - the private key string.
   */
  protected async getPrivateKey(walletId?: string): Promise<string> {
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
   * @returns {WalletEntity[]} wallets that were fetched.
   */
  async fetchWallets(): Promise<WalletEntity[]> {
    const res = await (this.isPortal() || this.isParaConnect()
      ? this.ctx.client.getAllWallets(this.userId)
      : this.ctx.client.getWallets(this.userId, true));

    return res.data.wallets.filter(
      wallet =>
        !!wallet.address &&
        (this.isParaConnect() || (!this.isParaConnect() && this.isWalletSupported(entityToWallet(wallet)))),
    );
  }

  private async populateWalletAddresses(): Promise<void> {
    const res = await this.ctx.client.getWallets(this.userId, true);
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

  private async populatePregenWalletAddresses(): Promise<void> {
    const res = await this.getPregenWallets();

    res.forEach(entity => {
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
   * Checks if a user exists for an email address.
   * @param {Object} opts the options object
   * @param {string} opts.email the email to check.
   * @returns true if user exists, false otherwise.
   */
  async checkIfUserExists({ email }: { email: string }): Promise<boolean> {
    const res = await this.ctx.client.checkUserExists({ email });
    return res.data.exists;
  }

  /**
   * Checks if a user exists for a phone number.
   * @param {Object} opts the options object
   * @param {string} opts.phone - phone number to check.
   * @param {string} opts.countryCode - the country code.
   * @returns true if user exists, false otherwise.
   */
  async checkIfUserExistsByPhone({ phone, countryCode }: { phone: string; countryCode: string }): Promise<boolean> {
    const res = await this.ctx.client.checkUserExists({ phone, countryCode });
    return res.data.exists;
  }

  /**
   * Creates a new user.
   * @param {Object} opts the options object
   * @param {string} opts.email the email to use.
   */
  async createUser({ email }: Auth<'email'>): Promise<void> {
    this.requireApiKey();
    await this.setEmail(email);
    const { userId } = await this.ctx.client.createUser({
      email: this.email,
      ...this.getVerificationEmailProps(),
    });
    await this.setUserId(userId);
  }

  /**
   * Creates a new user with a phone number.
   * @param {Object} opts the options object
   * @param {string} opts.phone - the phone number to use for creating the user.
   * @param {string} opts.countryCode - the country code to use for creating the user.
   */
  async createUserByPhone({ phone, countryCode }: Auth<'phone'>): Promise<void> {
    this.requireApiKey();
    await this.setPhoneNumber(phone, countryCode as CountryCallingCode);
    const { userId } = await this.ctx.client.createUser({
      phone: this.phone,
      countryCode: this.countryCode,
    });
    await this.setUserId(userId);
  }

  /**
   * Logs in or creates a new user using an external wallet address.
   * @param {Object} opts the options object
   * @param {string} opts.address the external wallet address to use for identification.
   * @param {WalletType} opts.type type of external wallet to use for identification.
   * @param {string} opts.provider the name of the provider for the external wallet.
   */
  async externalWalletLogin(wallet: ExternalWalletInfo): Promise<ExternalWalletLoginRes> {
    this.requireApiKey();
    const res = await this.ctx.client.externalWalletLogin({
      externalAddress: wallet.address,
      type: wallet.type,
      externalWalletProvider: wallet.provider,
      shouldTrackUser: wallet.shouldTrackUser,
    });
    await this.setExternalWallet(wallet);
    await this.setUserId(res.userId);

    return res;
  }

  /**
   * Returns whether or not the user is connected with an external wallet.
   */
  protected isUsingExternalWallet(): boolean {
    return !!Object.keys(this.externalWallets).length;
  }

  /**
   * Passes the email code obtained from the user for verification.
   * @param {Object} opts the options object
   * @param {string} verificationCode the six-digit code to check
   * @returns {string} the web auth url for creating a new credential
   */
  async verifyEmail({ verificationCode }: { verificationCode: string }): Promise<string> {
    await this.ctx.client.verifyEmail(this.userId, { verificationCode });
    return this.getSetUpBiometricsURL();
  }

  async verifyExternalWallet({
    address,
    signedMessage,
    cosmosPublicKeyHex,
    cosmosSigner,
  }: {
    address: string;
    signedMessage: string;
    cosmosPublicKeyHex?: string;
    cosmosSigner?: string;
  }): Promise<string> {
    await this.ctx.client.verifyExternalWallet(this.userId, { address, signedMessage, cosmosPublicKeyHex, cosmosSigner });
    return this.getSetUpBiometricsURL();
  }

  /**
   * Passes the phone code obtained from the user for verification.
   * @param {Object} opts the options object
   * @param {string} verificationCode the six-digit code to check
   * @returns {string} the web auth url for creating a new credential
   */
  async verifyPhone({ verificationCode }: { verificationCode: string }): Promise<string> {
    await this.ctx.client.verifyPhone(this.userId, { verificationCode });
    return this.getSetUpBiometricsURLForPhone();
  }

  /**
   * Validates the response received from an attempted Telegram login for authenticity, then
   * creates or retrieves the corresponding Para user and prepares the Para instance to sign in with that user.
   * @param authResponse - the response JSON object received from the Telegram widget.
   * @returns `{ isValid: boolean; telegramUserId?: string; userId?: string; isNewUser?: boolean; supportedAuthMethods?: AuthMethod[]; biometricHints?: BiometricLocationHint[] }`
   */
  async verifyTelegram(authObject: TelegramAuthResponse): Promise<VerifyTelegramRes> {
    const res = await this.ctx.client.verifyTelegram(authObject);

    if (res.isValid) {
      await this.setUserId(res.userId);
      await this.setTelegramUserId(res.telegramUserId);

      await this.touchSession(true);
      if (!this.loginEncryptionKeyPair) {
        await this.setLoginEncryptionKeyPair();
      }
    }

    return res;
  }

  /**
   * Performs 2FA verification.
   * @param {Object} opts the options object
   * @param {string} opts.email the email to use for performing a 2FA verification.
   * @param {string} opts.verificationCode the verification code to received via 2FA.
   * @returns {Object} `{ address, initiatedAt, status, userId, walletId }`
   */
  async verify2FA({ email, verificationCode }: { email: string; verificationCode: string }): Promise<{
    initiatedAt?: Date;
    status?: RecoveryStatus;
    userId: string;
    wallets: Pick<Wallet, 'address' | 'id'>[];
  }> {
    const res = await this.ctx.client.verify2FA(email, verificationCode);
    return {
      initiatedAt: res.data.initiatedAt,
      status: res.data.status,
      userId: res.data.userId,
      wallets: res.data.wallets,
    };
  }

  /**
   * Performs 2FA verification.
   * @param {Object} opts the options object
   * @param {string} opts.phone the phone number
   * @param {string} opts.countryCode - the country code
   * @param {string} opts.verificationCode - verification code to received via 2FA.
   * @returns {Object} `{ address, initiatedAt, status, userId, walletId }`
   */
  async verify2FAForPhone({
    phone,
    countryCode,
    verificationCode,
  }: {
    phone: string;
    countryCode: string;
    verificationCode: string;
  }): Promise<{
    initiatedAt?: Date;
    status?: RecoveryStatus;
    userId: string;
    wallets: Pick<Wallet, 'address' | 'id'>[];
  }> {
    const res = await this.ctx.client.verify2FAForPhone(phone, countryCode, verificationCode);
    return {
      initiatedAt: res.data.initiatedAt,
      status: res.data.status,
      userId: res.data.userId,
      wallets: res.data.wallets,
    };
  }

  /**
   * Sets up two-factor authentication for the current user.
   * @returns {string} uri - uri to use for setting up 2FA
   * */
  async setup2FA(): Promise<{
    uri?: string;
  }> {
    const res = await this.ctx.client.setup2FA(this.userId);
    return {
      uri: res.data.uri,
    };
  }

  /**
   * Enables 2FA.
   * @param {Object} opts the options object
   * @param {string} opts.verificationCode - the verification code received via 2FA.
   */
  async enable2FA({ verificationCode }: { verificationCode: string }): Promise<void> {
    await this.ctx.client.enable2FA(this.userId, verificationCode);
  }

  /**
   * Determines if 2FA has been set up.
   * @returns {Object} `{ isSetup: boolean }` - true if 2FA is setup, false otherwise
   */
  async check2FAStatus(): Promise<{
    isSetup: boolean;
  }> {
    if (!this.userId) {
      return { isSetup: false };
    }
    const res = await this.ctx.client.check2FAStatus(this.userId);
    return {
      isSetup: res.data.isSetup,
    };
  }

  /**
   * Resend a verification email for the current user.
   */
  async resendVerificationCode(): Promise<void> {
    await this.ctx.client.resendVerificationCode({
      userId: this.userId,
      ...this.getVerificationEmailProps(),
    });
  }

  /**
   * Resend a verification SMS for the current user.
   */
  async resendVerificationCodeByPhone(): Promise<void> {
    await this.ctx.client.resendVerificationCodeByPhone({
      userId: this.userId,
    });
  }

  /**
   * Returns a URL for setting up a new WebAuth passkey.
   * @param {Object} opts the options object
   * @param {string} opts.authType - the auth type to use
   * @param {boolean} opts.isForNewDevice whether the passkey is for a new device of an existing user
   * @returns {string} the URL
   */
  async getSetUpBiometricsURL({
    authType = 'email',
    isForNewDevice = false,
  }: Pick<PortalUrlOptions, 'authType' | 'isForNewDevice'> = {}): Promise<string> {
    const res = await this.ctx.client.addSessionPublicKey(this.userId, {
      status: PublicKeyStatus.PENDING,
      type: PublicKeyType.WEB,
    });

    return this.getWebAuthURLForCreate({
      authType,
      isForNewDevice,
      webAuthId: res.data.id,
      partnerId: res.data.partnerId,
    });
  }

  /**
   * Returns a URL for setting up a new WebAuth passkey for a phone number.
   * @param {Object} opts the options object
   * @param {boolean} opts.isForNewDevice whether the passkey is for a new device of an existing user
   * @returns {string} the URL
   */
  async getSetUpBiometricsURLForPhone({
    isForNewDevice = false,
  }: Pick<PortalUrlOptions, 'isForNewDevice'> = {}): Promise<string> {
    const res = await this.ctx.client.addSessionPublicKey(this.userId, {
      status: PublicKeyStatus.PENDING,
      type: PublicKeyType.WEB,
    });

    return this.getWebAuthURLForCreate({
      authType: 'phone',
      isForNewDevice,
      webAuthId: res.data.id,
      partnerId: res.data.partnerId,
    });
  }

  /**
   * Returns a URL for setting up a new password.
   * @param {Object} opts the options object
   * @param {string} opts.authType - the auth type to use
   * @param {boolean} opts.isForNewDevice whether the passkey is for a new device of an existing user
   * @param {Theme} [opts.theme] the portal theme to use in place of the partner's default
   * @returns {string} the URL
   */
  async getSetupPasswordURL({
    authType = 'email',
    isForNewDevice = false,
    theme,
  }: Pick<PortalUrlOptions, 'authType' | 'isForNewDevice' | 'theme'> = {}): Promise<string> {
    const res = await this.ctx.client.addSessionPasswordPublicKey(this.userId, {
      status: PasswordStatus.PENDING,
    });

    return this.getPasswordURLForCreate({
      authType,
      isForNewDevice,
      passwordId: res.data.id,
      partnerId: res.data.partnerId,
      theme,
    });
  }

  /**
   * Checks if the current session is active.
   * @returns `true` if active, `false` otherwise
   */
  async isSessionActive(): Promise<boolean> {
    if (this.isUsingExternalWallet()) {
      return true;
    }

    const res = await this.touchSession();

    return !!res.data.isAuthenticated;
  }

  /**
   * Checks if a session is active and a wallet exists.
   * @returns `true` if active, `false` otherwise
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

  protected async supportedAuthMethods(auth: Auth): Promise<Set<AuthMethod>> {
    const { supportedAuthMethods } = await this.ctx.client.getSupportedAuthMethods(auth);

    const authMethods = new Set<AuthMethod>();
    for (const type of supportedAuthMethods) {
      switch (type) {
        case 'PASSWORD':
          authMethods.add(AuthMethod.PASSWORD);
          break;
        case 'BIOMETRIC':
          authMethods.add(AuthMethod.PASSKEY);
          break;
      }
    }
    return authMethods;
  }

  /**
   * Get hints associated with the users stored biometrics.
   * @returns Array containing useragents and AAGuids for stored biometrics
   */
  protected async getUserBiometricLocationHints(): Promise<BiometricLocationHint[]> {
    if (!this.email && !this.phone && !this.farcasterUsername && !this.telegramUserId) {
      throw new Error('one of email, phone or farcaster username are required to get biometric location hints');
    }
    return await this.ctx.client.getBiometricLocationHints({
      email: this.email,
      phone: this.phone,
      countryCode: this.countryCode,
      farcasterUsername: this.farcasterUsername,
      telegramUserId: this.telegramUserId,
    });
  }

  private async setAuth(auth: Auth): Promise<ExtractAuth | undefined> {
    const authInfo = extractAuthInfo(auth);

    if (!authInfo) {
      return undefined;
    }

    switch (authInfo.authType) {
      case 'email':
        await this.setEmail(authInfo.identifier);
        break;
      case 'phone':
        await this.setPhoneNumber(authInfo.auth.phone, authInfo.auth.countryCode as CountryCallingCode);
        break;
      case 'farcaster':
        await this.setFarcasterUsername(authInfo.identifier);
        break;
      case 'telegram':
        await this.setTelegramUserId(authInfo.identifier);
        break;
    }
    return authInfo;
  }

  /**
   * Initiates a login.
   * @param {Object} opts the options object
   * @param {String} opts.email - the email to login with
   * @param {boolean} opts.useShortURL - whether to shorten the link
   * @returns - the WebAuth URL for logging in
   **/
  async initiateUserLogin({ useShortUrl = false, ...auth }: Auth & { useShortUrl?: boolean }): Promise<string> {
    const authInfo = await this.setAuth(auth);

    if (!authInfo) {
      return;
    }

    const res = await this.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      await this.setLoginEncryptionKeyPair();
    }

    const webAuthLoginURL = await this.getWebAuthURLForLogin({
      authType: authInfo.authType,
      sessionId: res.data.sessionId,
      partnerId: res.data.partnerId,
      loginEncryptionPublicKey: getPublicKeyHex(this.loginEncryptionKeyPair),
    });

    if (!useShortUrl) {
      return webAuthLoginURL;
    }

    return this.shortenLoginLink(webAuthLoginURL);
  }

  /**
   * Initiates a login.
   * @param email - the email to login with
   * @returns - a set of supported auth methods for the user
   **/
  async initiateUserLoginV2(auth: Auth): Promise<Set<AuthMethod>> {
    const authInfo = await this.setAuth(auth);

    if (!authInfo) {
      return;
    }

    await this.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      await this.setLoginEncryptionKeyPair();
    }

    return await this.supportedAuthMethods(authInfo.auth);
  }

  /**
   * Initiates a login.
   * @param opts the options object
   * @param opts.phone the phone number
   * @param opts.countryCode the country code
   * @param opts.useShortURL - whether to shorten the link
   * @returns - the WebAuth URL for logging in
   **/
  async initiateUserLoginForPhone({
    useShortUrl = false,
    ...auth
  }: Auth<'phone'> & { useShortUrl?: boolean }): Promise<string> {
    await this.setAuth(auth);

    const res = await this.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      await this.setLoginEncryptionKeyPair();
    }

    const webAuthLoginURL = await this.getWebAuthURLForLoginForPhone({
      sessionId: res.data.sessionId,
      loginEncryptionPublicKey: getPublicKeyHex(this.loginEncryptionKeyPair),
      partnerId: res.data.partnerId,
    });

    if (!useShortUrl) {
      return webAuthLoginURL;
    }

    return this.shortenLoginLink(webAuthLoginURL);
  }

  /**
   * Waits for the session to be active.
   **/
  async waitForAccountCreation({ popupWindow }: { popupWindow?: Window | null } = {}): Promise<boolean> {
    await this.touchSession();

    // Remove external wallets if creating an account with Para
    this.externalWallets = {};

    this.isAwaitingAccountCreation = true;
    while (this.isAwaitingAccountCreation) {
      try {
        await new Promise(resolve => setTimeout(resolve, constants.POLLING_INTERVAL_MS));

        if (await this.isSessionActive()) {
          this.isAwaitingAccountCreation = false;

          dispatchEvent(ParaEvent.ACCOUNT_CREATION_EVENT, true);
          return true;
        } else {
          if (popupWindow?.closed) {
            this.isAwaitingAccountCreation = false;
            return false;
          }
        }
      } catch (err) {
        // want to continue polling on error
        console.error(err);
      }
    }

    return false;
  }

  async waitForPasskeyAndCreateWallet({
    popupWindow,
  }: {
    popupWindow?: Window;
  } = {}): Promise<AccountSetupResponse> {
    await this.waitForAccountCreation({ popupWindow });

    const pregenWallets = await this.getPregenWallets();

    let recoverySecret: string | undefined,
      walletIds: CurrentWalletIds = {};

    if (pregenWallets.length > 0) {
      recoverySecret = await this.claimPregenWallets();
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

    const resp = { walletIds, recoverySecret };
    dispatchEvent(ParaEvent.ACCOUNT_SETUP_EVENT, resp);
    return resp;
  }

  /**
   * Initiates a Farcaster login attempt and return the URI for the user to connect.
   * You can create a QR code with this URI that works with Farcaster's mobile app.
   * @return {string} the Farcaster connect URI
   */
  async getFarcasterConnectURL(): Promise<string> {
    await this.logout();
    await this.touchSession(true);
    const {
      data: { connect_uri },
    } = await this.ctx.client.initializeFarcasterLogin();
    return connect_uri;
  }

  /**
   * Awaits the response from a user's attempt to log in with Farcaster.
   * If successful, this returns the user's Farcaster username and profile picture and indicates whether the user already exists.
   * @return {Object} `{userExists: boolean; username: string; pfpUrl?: string | null }` - the user's information and whether the user already exists.
   */
  async waitForFarcasterStatus(): Promise<{
    userExists: boolean;
    username: string;
    pfpUrl?: string | null;
  }> {
    this.isAwaitingFarcaster = true;
    while (this.isAwaitingFarcaster) {
      try {
        await new Promise(resolve => setTimeout(resolve, constants.POLLING_INTERVAL_MS));

        const res = await this.ctx.client.getFarcasterAuthStatus();
        if (res.data.state === 'completed') {
          const { userId, userExists, username, pfpUrl } = res.data;
          await this.setUserId(userId);
          await this.setFarcasterUsername(username);
          return {
            userExists,
            username,
            pfpUrl,
          };
        }
      } catch (err) {
        console.error(err);
        this.isAwaitingFarcaster = false;
      }
    }
  }

  /**
   * Generates a URL for the user to log in with OAuth using a desire method.
   *
   * @param {Object} opts the options object
   * @param {OAuthMethod} opts.method the third-party service to use for OAuth.
   * @param {string} [opts.deeplinkUrl] the deeplink to redirect to after the OAuth flow. This is for mobile only.
   * @returns {string} the URL for the user to log in with OAuth.
   */
  async getOAuthURL({ method, deeplinkUrl }: { method: OAuthMethod; deeplinkUrl?: string }): Promise<string> {
    await this.logout();
    const res = await this.touchSession(true);

    return constructUrl({
      base: method === OAuthMethod.TELEGRAM ? getPortalBaseURL(this.ctx, true) : getBaseOAuthUrl(this.ctx.env),
      path: `/auth/${method.toLowerCase()}`,
      params: {
        apiKey: this.ctx.apiKey,
        sessionLookupId: res.data.sessionLookupId,
        deeplinkUrl,
      },
    });
  }

  /**
   * Awaits the response from a user's attempt to log in with OAuth.
   * If successful, this returns the user's email address and indicates whether the user already exists.
   *
   * @param {Object} opts the options object.
   * @param {Window} [opts.popupWindow] the popup window being used for login.
   * @return {Object} `{ email?: string; isError?: boolean; userExists: boolean; }` the result data
   */
  async waitForOAuth({ popupWindow }: { popupWindow?: Window | null } = {}): Promise<{
    email?: string;
    isError?: boolean;
    userExists: boolean;
  }> {
    this.isAwaitingOAuth = true;
    while (this.isAwaitingOAuth) {
      try {
        if (popupWindow?.closed) {
          return { isError: true, userExists: false };
        }

        await new Promise(resolve => setTimeout(resolve, constants.POLLING_INTERVAL_MS));

        if (this.isAwaitingOAuth) {
          const res = await this.touchSession();
          if (res.data.userId) {
            const { userId, email } = res.data;
            if (!this.loginEncryptionKeyPair) {
              await this.setLoginEncryptionKeyPair();
            }
            await this.setUserId(userId);
            await this.setEmail(email);
            const userExists = await this.checkIfUserExists({ email });
            this.isAwaitingOAuth = false;
            return {
              userExists,
              email,
            };
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    return { userExists: false };
  }

  /**
   * Waits for the session to be active and sets up the user.
   *
   * @param {Object} opts the options object
   * @param {Window} [opts.popupWindow] the popup window being used for login.
   * @param {boolean} [opts.skipSessionRefresh] whether to skip refreshing the session.
   * @returns {Object} `{ isComplete: boolean; isError: boolean; needsWallet: boolean; partnerId: string; }` the result data
   **/
  async waitForLoginAndSetup({
    popupWindow,
    skipSessionRefresh = false,
  }: {
    popupWindow?: Window | null;
    skipSessionRefresh?: boolean;
  } = {}): Promise<LoginResponse> {
    // Remove external wallets if logging in with Capsule
    this.externalWallets = {};

    this.isAwaitingLogin = true;
    while (this.isAwaitingLogin) {
      try {
        await new Promise(resolve => setTimeout(resolve, constants.POLLING_INTERVAL_MS));

        if (!(await this.isSessionActive())) {
          if (popupWindow?.closed) {
            const resp = { isComplete: false, isError: true };
            dispatchEvent(ParaEvent.LOGIN_EVENT, resp, 'failed to setup user');
            return resp;
          }
          continue;
        }

        const postLoginData = await this.userSetupAfterLogin();

        const needsWallet = postLoginData.data.needsWallet ?? false;

        if (!needsWallet) {
          if (this.currentWalletIdsArray.length === 0) {
            if (popupWindow?.closed) {
              const resp = { isComplete: false, isError: true };
              dispatchEvent(ParaEvent.LOGIN_EVENT, resp, 'failed to setup user');
              return resp;
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
          await this.setupAfterLogin({ temporaryShares: tempSharesRes.data.temporaryShares, skipSessionRefresh });

          await this.claimPregenWallets();

          const resp = {
            isComplete: true,
            needsWallet: needsWallet || Object.values(this.wallets).length === 0,
            partnerId: postLoginData.data.partnerId,
          };

          dispatchEvent(ParaEvent.LOGIN_EVENT, resp);
          return resp;
        }
      } catch (err) {
        // want to continue polling on error
        console.error(err);
      }
    }

    const resp = { isComplete: false };
    dispatchEvent(ParaEvent.LOGIN_EVENT, resp, 'exitted login without setting up user');
    return resp;
  }

  /**
   * Updates the session with the user management server, possibly
   * opening a popup to refresh the session.
   *
   * @param {Object} opts the options object.
   * @param {boolean} [shouldOpenPopup] - if `true`, the running device will open a popup to reauthenticate the user.
   * @returns a URL for the user to reauthenticate.
   **/
  async refreshSession({ shouldOpenPopup = false }: { shouldOpenPopup?: boolean } = {}): Promise<string> {
    const res = await this.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      await this.setLoginEncryptionKeyPair();
    }

    const link = await this.getWebAuthURLForLogin({
      sessionId: res.data.sessionId,
      loginEncryptionPublicKey: getPublicKeyHex(this.loginEncryptionKeyPair),
    });

    if (shouldOpenPopup) {
      this.platformUtils.openPopup(link);
    }

    return link;
  }

  /**
   * Call this method after login to ensure that the user ID is set
   * internally.
   **/
  protected async userSetupAfterLogin(): Promise<{
    data: { partnerId?: string; needsWallet?: boolean; sessionLookupId: string };
  }> {
    const res = await this.touchSession();
    await this.setUserId(res.data.userId);

    if (res.data.currentWalletIds && res.data.currentWalletIds !== this.currentWalletIds)
      await this.setCurrentWalletIds(res.data.currentWalletIds, {
        sessionLookupId: this.isPortal() ? res.data.sessionLookupId : undefined,
      });

    return res;
  }

  /**
   * Get transmission shares associated with session.
   * @param {Object} opts the options object.
   * @param {boolean} opts.isForNewDevice - true if this device is registering.
   * @returns - transmission keyshares.
   **/
  protected async getTransmissionKeyShares({ isForNewDevice = false }: { isForNewDevice?: boolean } = {}): Promise<any> {
    const res = await this.touchSession();
    const sessionLookupId = isForNewDevice ? `${res.data.sessionLookupId}-new-device` : res.data.sessionLookupId;
    return this.ctx.client.getTransmissionKeyshares(this.userId, sessionLookupId);
  }

  /**
   * Call this method after login to perform setup.
   * @param {Object} opts the options object.
   * @param {any[]} opts.temporaryShares optional temporary shares to use for decryption.
   * @param {boolean} [opts.skipSessionRefresh] - whether or not to skip refreshing the session.
   **/
  async setupAfterLogin({
    temporaryShares,
    skipSessionRefresh = false,
  }: { temporaryShares?: any[]; skipSessionRefresh?: boolean } = {}): Promise<void> {
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
   * @param {Object} opts the options object.
   * @param {string} opts.walletId the wallet to distribute the recovery share for.
   * @param {string} opts.userShare optional user share generate the recovery share from. Defaults to the signer from the passed in walletId
   * @param {boolean} opts.skipBiometricShareCreation whether or not to skip biometric share creation. Used when regenerating recovery shares.
   * @param {boolean} opts.forceRefreshRecovery whether or not to force recovery secret regeneration. Used when regenerating recovery shares.
   * @returns {string} the recovery share.
   **/
  async distributeNewWalletShare({
    walletId,
    userShare,
    skipBiometricShareCreation = false,
    forceRefresh = false,
  }: {
    walletId: string;
    userShare?: string;
    skipBiometricShareCreation?: boolean;
    forceRefresh?: boolean;
  }): Promise<string> {
    let userSigner = userShare;

    if (!userSigner) {
      userSigner = this.wallets[walletId].signer;
    }

    const recoveryShare = skipBiometricShareCreation
      ? await sendRecoveryForShare({
          ctx: this.ctx,
          userId: this.userId,
          walletId,
          userSigner,
          emailProps: this.getBackupKitEmailProps(),
          forceRefresh,
        })
      : await distributeNewShare({
          ctx: this.ctx,
          userId: this.userId,
          walletId,
          userShare: userSigner,
          emailProps: this.getBackupKitEmailProps(),
        });
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
        const res = await this.ctx.client.getWallets(this.userId);
        const wallet = res.data.wallets.find(w => w.id === walletId);
        if (wallet && wallet.address) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, constants.SHORT_POLLING_INTERVAL_MS));
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
  private async waitForPregenWalletAddress(walletId: string): Promise<void> {
    let maxPolls = 0;

    while (true) {
      try {
        if (maxPolls === 10) {
          break;
        }
        ++maxPolls;
        const res = await this.getPregenWallets();

        const wallet = res.find(w => w.id === walletId);
        if (wallet && wallet.address) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, constants.SHORT_POLLING_INTERVAL_MS));
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
   * @param {Object} [opts] the options object.
   * @param {boolean} [opts.skipDistribute] if `true`, the wallets' recovery share will not be distributed.
   * @param {WalletType[]} [opts.types] the types of wallets to create.
   * @returns {Object} the wallets created, their ids, and the recovery secret.
   **/
  async createWalletPerType({
    skipDistribute = false,
    types,
  }: {
    skipDistribute?: boolean;
    types?: WalletType[];
  } = {}): Promise<{ wallets: Wallet[]; walletIds: CurrentWalletIds; recoverySecret?: string }> {
    const wallets: Wallet[] = [];
    const walletIds: CurrentWalletIds = {};
    let recoverySecret: string;

    for (const type of await this.getTypesToCreate(types)) {
      const [wallet, recoveryShare] = await this.createWallet({ type, skipDistribute });
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

  /**
   * Refresh the current user share for a wallet.
   *
   * @param {Object} opts the options object.
   * @param {string} opts.walletId the wallet id to refresh.
   * @param {string} opts.share the current user share.
   * @param {string} [opts.oldPartnerId] the current partner id.
   * @param {string} [opts.newPartnerId] the new partner id to set, if any.
   * @param {string} [opts.keyShareProtocolId]
   * @param {boolean} [opts.redistributeBackupEncryptedShares] whether or not to redistribute backup encrypted shares.
   * @returns {Object} the new user share and recovery secret.
   **/
  async refreshShare({
    walletId,
    share,
    oldPartnerId,
    newPartnerId,
    keyShareProtocolId,
    redistributeBackupEncryptedShares,
  }: {
    walletId: string;
    share: string;
    oldPartnerId?: string;
    newPartnerId?: string;
    keyShareProtocolId?: string;
    redistributeBackupEncryptedShares?: boolean;
    emailProps?: BackupKitEmailProps;
  }): Promise<{ signer: string; recoverySecret?: string; protocolId: string }> {
    const { signer, protocolId } = await this.platformUtils.refresh(
      this.ctx,
      this.retrieveSessionCookie(),
      this.userId,
      walletId,
      share,
      oldPartnerId,
      newPartnerId,
      keyShareProtocolId,
    );
    const recoverySecret = await distributeNewShare({
      ctx: this.ctx,
      userId: this.userId,
      walletId,
      userShare: signer,
      ignoreRedistributingBackupEncryptedShare: !redistributeBackupEncryptedShares,
      emailProps: this.getBackupKitEmailProps(),
      partnerId: newPartnerId,
      protocolId,
    });
    return { signer, recoverySecret, protocolId };
  }

  /**
   * Creates a new wallet.
   * @param {Object} opts the options object.
   * @param {WalletType} opts.type the type of wallet to create.
   * @param {boolean} opts.skipDistribute - if true, recovery share will not be distributed.
   * @returns {[Wallet, string | null]} `[wallet, recoveryShare]` - the wallet object and the new recovery share.
   **/
  async createWallet({
    type: _type,
    skipDistribute = false,
  }: {
    type?: WalletType;
    skipDistribute?: boolean;
  } = {}): Promise<[Wallet, string | null]> {
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
      scheme: walletType === WalletType.SOLANA ? WalletScheme.ED25519 : WalletScheme.DKLS,
      type: walletType,
    };
    wallet = this.wallets[walletId];

    await this.waitForWalletAddress(wallet.id);
    await this.populateWalletAddresses();

    let recoveryShare: string | null = null;
    if (!skipDistribute) {
      recoveryShare = await distributeNewShare({
        ctx: this.ctx,
        userId: this.userId,
        walletId: wallet.id,
        userShare: signer,
        emailProps: this.getBackupKitEmailProps(),
      });
    }

    await this.setCurrentWalletIds({
      ...this.currentWalletIds,
      [walletType]: [...(this.currentWalletIds[walletType] ?? []), walletId],
    });

    const walletNoSigner = { ...wallet };
    delete walletNoSigner.signer;

    dispatchEvent<WalletCreatedResponse>(ParaEvent.WALLET_CREATED, {
      wallet: walletNoSigner,
      recoverySecret: recoveryShare,
    });
    return [wallet, recoveryShare];
  }

  /**
   * Creates a new pregenerated wallet.
   *
   * @param {Object} opts the options object.
   * @param {string} opts.pregenIdentifier the identifier associated with the new wallet.
   * @param {TPregenIdentifierType} [opts.pregenIdentifierType] the identifier type. Defaults to `EMAIL`.
   * @param {WalletType} [opts.type] the type of wallet to create. Defaults to the first non-optional type in the instance's `supportedWalletTypes` array.
   * @returns {Wallet} the created wallet.
   **/
  async createPregenWallet(opts: {
    type: WalletType;
    pregenIdentifier: string;
    pregenIdentifierType: TPregenIdentifierType;
  }): Promise<Wallet> {
    const {
      type: _type = this.supportedWalletTypes.find(({ optional }) => !optional)?.type,
      pregenIdentifier,
      pregenIdentifierType = 'EMAIL',
    } = opts;
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
      scheme: walletType === WalletType.SOLANA ? WalletScheme.ED25519 : WalletScheme.DKLS,
      type: walletType,
      isPregen: true,
      pregenIdentifier,
      pregenIdentifierType,
    };

    await this.waitForPregenWalletAddress(walletId);
    await this.populatePregenWalletAddresses();

    return this.wallets[walletId];
  }

  /**
   * Creates new pregenerated wallets for each desired type.
   * If no types are provided, this method will create one for each of the non-optional types
   * specified in the instance's `supportedWalletTypes` array that are not already present.
   * @param {Object} opts the options object.
   * @param {string} opts.pregenIdentifier the identifier to associate each wallet with.
   * @param {TPregenIdentifierType} opts.pregenIdentifierType - either `'EMAIL'` or `'PHONE'`.
   * @param {WalletType[]} [opts.types] the wallet types to create. Defaults to any types the instance supports that are not already present.
   * @returns {Wallet[]} an array containing the created wallets.
   **/
  async createPregenWalletPerType({
    types,
    pregenIdentifier,
    pregenIdentifierType = 'EMAIL',
  }: {
    pregenIdentifier: string;
    pregenIdentifierType: TPregenIdentifierType;
    types?: WalletType[];
  }): Promise<Wallet[]> {
    const wallets = [];
    for (const type of await this.getTypesToCreate(types)) {
      const wallet = await this.createPregenWallet({ type, pregenIdentifier, pregenIdentifierType });

      wallets.push(wallet);
    }
    return wallets;
  }

  /**
   * Claims a pregenerated wallet.
   *
   * @param {Object} opts the options object.
   * @param {string} opts.pregenIdentifier string the identifier of the user claiming the wallet
   * @param {TPregenIdentifierType} opts.pregenIdentifierType type of the identifier of the user claiming the wallet
   * @returns {[Wallet, string | null]} `[wallet, recoveryShare]` - the wallet object and the new recovery share.
   **/
  async claimPregenWallets({
    pregenIdentifier,
    pregenIdentifierType = !!pregenIdentifier ? 'EMAIL' : undefined,
  }: {
    pregenIdentifier?: string;
    pregenIdentifierType?: TPregenIdentifierType;
  } = {}): Promise<string | undefined> {
    this.requireApiKey();

    const pregenWallets =
      pregenIdentifier && pregenIdentifierType
        ? await this.getPregenWallets({ pregenIdentifier, pregenIdentifierType })
        : await this.getPregenWallets();

    if (pregenWallets.length === 0) {
      return undefined;
    }

    let newRecoverySecret: string | undefined;

    const { walletIds } = await this.ctx.client.claimPregenWallets({
      userId: this.userId,
      walletIds: pregenWallets.map(w => w.id),
    });

    for (const walletId of walletIds) {
      const wallet = this.wallets[walletId];
      let refreshedShare;

      if (wallet.scheme === WalletScheme.ED25519) {
        const distributeRes = await distributeNewShare({
          ctx: this.ctx,
          userId: this.userId,
          walletId: wallet.id,
          userShare: this.wallets[wallet.id].signer,
          emailProps: this.getBackupKitEmailProps(),
          partnerId: wallet.partnerId,
        });

        if (distributeRes.length > 0) {
          newRecoverySecret = distributeRes;
        }
      } else {
        refreshedShare = await this.refreshShare({
          walletId: wallet.id,
          share: this.wallets[wallet.id].signer,
          oldPartnerId: wallet.partnerId,
          newPartnerId: wallet.partnerId,
          redistributeBackupEncryptedShares: true,
        });

        if (refreshedShare.recoverySecret) {
          newRecoverySecret = refreshedShare.recoverySecret;
        }
      }

      this.wallets[wallet.id] = {
        ...this.wallets[wallet.id],
        signer: refreshedShare?.signer ?? wallet.signer,
        userId: this.userId,
        pregenIdentifier: undefined,
        pregenIdentifierType: undefined,
      };

      const walletNoSigner = { ...this.wallets[wallet.id] };
      delete walletNoSigner.signer;

      dispatchEvent<PregenWalletClaimedResponse>(ParaEvent.PREGEN_WALLET_CLAIMED, {
        wallet: walletNoSigner,
        recoverySecret: newRecoverySecret,
      });
    }

    await this.setWallets(this.wallets);

    return newRecoverySecret;
  }

  /**
   * Updates the identifier for a pregen wallet.
   * @param {Object} opts the options object.
   * @param {string} opts.walletId the pregen wallet ID
   * @param {string} opts.newPregenIdentifier the new identtifier
   * @param {TPregenIdentifierType} opts.newPregenIdentifierType: the new identifier type
   **/
  async updatePregenWalletIdentifier({
    walletId,
    newPregenIdentifier,
    newPregenIdentifierType,
  }: {
    walletId: string;
    newPregenIdentifier: string;
    newPregenIdentifierType: TPregenIdentifierType;
  }): Promise<void> {
    this.requireApiKey();

    await this.ctx.client.updatePregenWallet(walletId, {
      pregenIdentifier: newPregenIdentifier,
      pregenIdentifierType: newPregenIdentifierType,
    });

    if (!!this.wallets[walletId]) {
      this.wallets[walletId] = {
        ...this.wallets[walletId],
        pregenIdentifier: newPregenIdentifier,
        pregenIdentifierType: newPregenIdentifierType,
      };

      await this.setWallets(this.wallets);
    }
  }

  /**
   * Checks if a pregen Wallet exists for the given identifier with the current partner.
   * @param {Object} opts the options object.
   * @param {string} opts.pregenIdentifier string the identifier of the user claiming the wallet
   * @param {TPregenIdentifierType} opts.pregenIdentifierType type of the string of the identifier of the user claiming the wallet
   * @returns {boolean} whether the pregen wallet exists
   **/
  async hasPregenWallet({
    pregenIdentifier,
    pregenIdentifierType,
  }: {
    pregenIdentifier: string;
    pregenIdentifierType: TPregenIdentifierType;
  }): Promise<boolean> {
    this.requireApiKey();

    // This function gets pregen wallets by identifier and partnerId
    const res = await this.getPregenWallets({ pregenIdentifier, pregenIdentifierType });
    const wallet = res.find(w => w.pregenIdentifier === pregenIdentifier && w.pregenIdentifierType === pregenIdentifierType);
    if (!wallet) {
      return false;
    }
    return true;
  }

  /**
   * Get pregen wallets for the given identifier.
   * @param {Object} opts the options object.
   * @param {string} opts.pregenIdentifier - the identifier of the user claiming the wallet
   * @param {TPregenIdentifierType} opts.pregenIdentifierType - type of the identifier of the user claiming the wallet
   * @returns {Promise<WalletEntity[]>} the array of found wallets
   **/
  async getPregenWallets({
    pregenIdentifier,
    pregenIdentifierType = !!pregenIdentifier ? 'EMAIL' : undefined,
  }: {
    pregenIdentifier?: string;
    pregenIdentifierType?: TPregenIdentifierType;
  } = {}): Promise<WalletEntity[]> {
    this.requireApiKey();
    const res = await this.ctx.client.getPregenWallets(
      pregenIdentifier && pregenIdentifierType ? { [pregenIdentifierType]: [pregenIdentifier] } : this.pregenIds,
      this.isPortal(),
      this.userId,
    );
    return res.wallets.filter(w => this.isWalletSupported(entityToWallet(w)));
  }

  private encodeWalletBase64(wallet: Wallet): string {
    const walletJson = JSON.stringify(wallet);
    const base64Wallet = Buffer.from(walletJson).toString('base64');
    return base64Wallet;
  }

  /**
   * Encodes the current wallets encoded in Base 64.
   * @returns {string} the encoded wallet string
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
   * Sets the current wallets from a Base 64 string.
   * @param {string} base64Wallet the encoded wallet string
   **/
  async setUserShare(base64Wallets: string | null): Promise<void> {
    if (!base64Wallets) {
      return;
    }

    const base64WalletsSplit = base64Wallets.split('-');
    for (const base64Wallet of base64WalletsSplit) {
      const walletJson = Buffer.from(base64Wallet, 'base64').toString();
      const wallet = migrateWallet(JSON.parse(walletJson));

      this.wallets[wallet.id] = wallet;
      await this.setWallets(this.wallets);
    }
  }

  private async getTransactionReviewUrl(transactionId: string, timeoutMs?: number): Promise<string> {
    const res = await this.touchSession();

    return this.constructPortalUrl('txReview', {
      partnerId: res.data.partnerId,
      pathId: transactionId,
      params: {
        email: this.email,
        timeoutMs: timeoutMs?.toString(),
      },
    });
  }

  private async getOnRampTransactionUrl({
    purchaseId,
    providerKey,
    ...walletParams
  }: { purchaseId: string; providerKey?: string } & WalletParams): Promise<string> {
    const res = await this.touchSession();
    const [key, identifier] = extractWalletRef(walletParams);

    return this.constructPortalUrl('onRamp', {
      partnerId: res.data.partnerId,
      pathId: purchaseId,
      sessionId: res.data.sessionId,
      params: {
        [key]: identifier,
        providerKey,
        currentWalletIds: JSON.stringify(this.currentWalletIds),
      },
    });
  }

  /**
   * Signs a message using one of the current wallets.
   *
   * If you want to sign the keccak256 hash of a message, hash the
   * message first and then pass in the base64 encoded hash.
   * @param {Object} opts the options object.
   * @param {string} opts.walletId the id of the wallet to sign with.
   * @param {string} opts.messageBase64 the base64 encoding of exact message that should be signed
   * @param {number} [opts.timeout] optional timeout in milliseconds. If not present, defaults to 30 seconds.
   * @param {string} [opts.cosmosSignDocBase64] the Cosmos `SignDoc` in base64, if applicable
   **/
  async signMessage({
    walletId,
    messageBase64,
    timeoutMs = 30000,
    cosmosSignDocBase64,
  }: {
    walletId: string;
    messageBase64: string;
    timeoutMs?: number;
    cosmosSignDocBase64?: string;
  }): Promise<FullSignatureRes> {
    this.assertIsValidWalletId(walletId);

    const wallet = this.wallets[walletId];
    let signerId: string = this.userId;
    if (wallet.partnerId && !wallet.userId) {
      signerId = wallet.partnerId;
    }

    let signRes = await this.signMessageInner({ wallet, signerId, messageBase64, cosmosSignDocBase64 });
    let timeStart = Date.now();
    if ((signRes as DeniedSignatureRes).pendingTransactionId) {
      this.platformUtils.openPopup(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId, timeoutMs),
        { type: cosmosSignDocBase64 ? PopupType.SIGN_TRANSACTION_REVIEW : PopupType.SIGN_MESSAGE_REVIEW },
      );
    } else {
      dispatchEvent(ParaEvent.SIGN_MESSAGE_EVENT, signRes);
      return signRes as SuccessfulSignatureRes;
    }

    await new Promise(resolve => setTimeout(resolve, constants.POLLING_INTERVAL_MS));
    while (true) {
      if (Date.now() - timeStart > timeoutMs) {
        break;
      }

      try {
        await this.ctx.client.getPendingTransaction(this.userId, signRes.pendingTransactionId);
      } catch (err) {
        const error = new TransactionReviewDenied();
        dispatchEvent(ParaEvent.SIGN_MESSAGE_EVENT, signRes, error.message);
        throw error;
      }

      signRes = await this.signMessageInner({ wallet, signerId, messageBase64, cosmosSignDocBase64 });

      if ((signRes as DeniedSignatureRes).pendingTransactionId) {
        await new Promise(resolve => setTimeout(resolve, constants.POLLING_INTERVAL_MS));
      } else {
        break;
      }
    }

    if ((signRes as DeniedSignatureRes).pendingTransactionId) {
      const error = new TransactionReviewTimeout(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId),
        (signRes as DeniedSignatureRes).pendingTransactionId,
      );
      dispatchEvent(ParaEvent.SIGN_MESSAGE_EVENT, signRes, error.message);
      throw error;
    }

    dispatchEvent(ParaEvent.SIGN_MESSAGE_EVENT, signRes);
    return signRes as SuccessfulSignatureRes;
  }

  private async signMessageInner({
    wallet,
    signerId,
    messageBase64,
    cosmosSignDocBase64,
  }: {
    wallet: Wallet;
    signerId: string;
    messageBase64: string;
    cosmosSignDocBase64?: string;
  }) {
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
   * @param {Object} opts the options object.
   * @param {string} opts.walletId the id of the wallet to sign with.
   * @param {string} opts.rlpEncodedTxBase64 the transaction to sign, in RLP base64 encoding
   * @param {string} [opts.chainId] the EVM chain id of the chain the transaction is being sent on, if applicable
   * @param {number} [opts.timeoutMs] the amount of time to wait for the user to sign the transaction, in milliseconds
   **/
  async signTransaction({
    walletId,
    rlpEncodedTxBase64,
    chainId,
    timeoutMs = 30000,
  }: {
    walletId: string;
    rlpEncodedTxBase64: string;
    chainId: string;
    timeoutMs?: number;
  }): Promise<FullSignatureRes> {
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
      dispatchEvent(ParaEvent.SIGN_TRANSACTION_EVENT, signRes);
      return signRes as SuccessfulSignatureRes;
    }

    await new Promise(resolve => setTimeout(resolve, constants.POLLING_INTERVAL_MS));
    while (true) {
      if (Date.now() - timeStart > timeoutMs) {
        break;
      }

      try {
        await this.ctx.client.getPendingTransaction(this.userId, (signRes as DeniedSignatureRes).pendingTransactionId);
      } catch (err) {
        const error = new TransactionReviewDenied();
        dispatchEvent(ParaEvent.SIGN_TRANSACTION_EVENT, signRes, error.message);
        throw error;
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
        await new Promise(resolve => setTimeout(resolve, constants.POLLING_INTERVAL_MS));
      } else {
        break;
      }
    }

    if ((signRes as DeniedSignatureRes).pendingTransactionId) {
      const error = new TransactionReviewTimeout(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId),
        (signRes as DeniedSignatureRes).pendingTransactionId,
      );
      dispatchEvent(ParaEvent.SIGN_TRANSACTION_EVENT, signRes, error.message);
      throw error;
    }

    dispatchEvent(ParaEvent.SIGN_TRANSACTION_EVENT, signRes);
    return signRes as SuccessfulSignatureRes;
  }

  /**
   * @deprecated
   * Sends a transaction.
   * @param walletId - id of the wallet to send the transaction from.
   * @param rlpEncodedTxBase64 - rlp encoded tx as base64 string
   * @param chainId - chain id of the chain the transaction is being sent on.
   **/
  async sendTransaction({
    walletId,
    rlpEncodedTxBase64,
    chainId,
  }: {
    walletId: string;
    rlpEncodedTxBase64: string;
    chainId: string;
  }): Promise<FullSignatureRes> {
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

      const error = new TransactionReviewError(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId),
      );
      throw error;
    }

    return signRes as SuccessfulSignatureRes;
  }

  protected isProviderModalDisabled(): boolean {
    return !!this.disableProviderModal;
  }

  /**
   * Starts a on-ramp or off-ramp transaction and returns the Para Portal link for the user to finalize and complete it.
   * @param {Object} opts the options object
   * @param {OnRampPurchaseCreateParams} opts.params the transaction settings.
   * @param {boolean} opts.shouldOpenPopup if `true`, a popup window with the link will be opened.
   * @param {string} opts.walletId the wallet ID to use for the transaction, where funds will be sent or withdrawn.
   * @param {string} opts.externalWalletAddress the external wallet address to send funds to or withdraw funds from, if using an external wallet.
   **/
  async initiateOnRampTransaction(
    options: WalletParams & { params: OnRampPurchaseCreateParams; shouldOpenPopup?: boolean },
  ): Promise<{
    onRampPurchase: OnRampPurchase;
    portalUrl: string;
  }> {
    const { params, shouldOpenPopup, ...walletParams } = options;

    const onRampPurchase = await this.ctx.client.createOnRampPurchase({
      userId: this.userId,
      params: {
        ...params,
        address:
          walletParams.externalWalletAddress ??
          this.getDisplayAddress(walletParams.walletId, { addressType: params.walletType }),
      },
      ...walletParams,
    });

    const portalUrl = await this.getOnRampTransactionUrl({
      purchaseId: onRampPurchase.id,
      providerKey: onRampPurchase.providerKey,
      ...walletParams,
    });

    if (shouldOpenPopup) {
      this.platformUtils.openPopup(portalUrl, { type: PopupType.ON_RAMP_TRANSACTION });
    }

    return { onRampPurchase, portalUrl };
  }

  /**
   * Returns `true` if session was successfully kept alive, `false` otherwise.
   **/
  async keepSessionAlive(): Promise<boolean> {
    try {
      await this.ctx.client.keepSessionAlive(this.userId!);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Serialize the current session for import by another Para instance.
   * @returns {string} the serialized session
   */
  exportSession(): string {
    const sessionInfo = {
      email: this.email,
      userId: this.userId,
      wallets: this.wallets,
      currentWalletIds: this.currentWalletIds,
      sessionCookie: this.sessionCookie,
      phone: this.phone,
      countryCode: this.countryCode,
      telegramUserId: this.telegramUserId,
      farcasterUsername: this.farcasterUsername,
      externalWallets: this.externalWallets,
    };
    return Buffer.from(JSON.stringify(sessionInfo)).toString('base64');
  }

  /**
   * Imports a session serialized by another Para instance.
   * @param {string} serializedInstanceBase64 the serialized session
   */
  async importSession(serializedInstanceBase64: string): Promise<void> {
    const serializedInstance = Buffer.from(serializedInstanceBase64, 'base64').toString('utf8');
    const sessionInfo = JSON.parse(serializedInstance);
    await this.setEmail(sessionInfo.email);
    await this.setTelegramUserId(sessionInfo.telegramUserId);
    await this.setFarcasterUsername(sessionInfo.farcasterUsername);
    await this.setUserId(sessionInfo.userId);
    await this.setWallets(sessionInfo.wallets);
    await this.setExternalWallets(sessionInfo.externalWallets || {});
    for (const walletId of Object.keys(this.wallets)) {
      if (!this.wallets[walletId].userId) {
        this.wallets[walletId].userId = this.userId;
      }
    }
    if (Object.keys(sessionInfo.currentWalletIds).length !== 0) {
      await this.setCurrentWalletIds(sessionInfo.currentWalletIds);
    } else {
      const currentWalletIds = {};
      for (const walletId of Object.keys(sessionInfo.wallets)) {
        currentWalletIds[sessionInfo.wallets[walletId].type] = [
          ...(currentWalletIds[sessionInfo.wallets[walletId].type] ?? []),
          walletId,
        ];
      }
      await this.setCurrentWalletIds(currentWalletIds);
    }

    this.persistSessionCookie(sessionInfo.sessionCookie);
    await this.setPhoneNumber(sessionInfo.phone, sessionInfo.countryCode);
  }

  protected exitAccountCreation() {
    this.isAwaitingAccountCreation = false;
  }

  protected exitLogin() {
    this.isAwaitingLogin = false;
  }

  protected exitFarcaster() {
    this.isAwaitingFarcaster = false;
  }

  protected exitOAuth() {
    this.isAwaitingOAuth = false;
  }

  protected exitLoops() {
    this.exitAccountCreation();
    this.exitLogin();
    this.exitFarcaster();
    this.exitOAuth();
  }

  /**
   * Retrieves a token to verify the current session.
   * @returns {Promise<string>} the ID
   **/
  async getVerificationToken(): Promise<string> {
    const { data } = await this.touchSession();

    return data.sessionLookupId;
  }

  /**
   * Logs the user out.
   * @param {Object} opts the options object.
   * @param {boolean} opts.clearPregenWallets if `true`, will remove all pregen wallets from storage
   **/
  async logout({ clearPregenWallets = false }: { clearPregenWallets?: boolean } = {}): Promise<void> {
    await this.ctx.client.logout();
    await this.clearStorage();

    if (!clearPregenWallets) {
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
    this.externalWallets = {};
    this.loginEncryptionKeyPair = undefined;
    this.email = undefined;
    this.telegramUserId = undefined;
    this.phone = undefined;
    this.countryCode = undefined;
    this.userId = undefined;
    this.sessionCookie = undefined;

    dispatchEvent(ParaEvent.LOGOUT_EVENT, null);
  }

  protected async getSupportedCreateAuthMethods(): Promise<Set<AuthMethod>> {
    const res = await this.touchSession();
    const partnerId = res.data.partnerId;

    const partnerRes = await this.ctx.client.getPartner(partnerId);

    let supportedAuthMethods = new Set<AuthMethod>();

    for (const authMethod of partnerRes.data.partner.supportedAuthMethods) {
      supportedAuthMethods.add(AuthMethod[authMethod]);
    }

    return supportedAuthMethods;
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
      telegramUserId: this.telegramUserId,
      farcasterUsername: this.farcasterUsername,
      userId: this.userId,
      pregenIds: this.pregenIds,
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

    return `Para ${JSON.stringify(obj, null, 2)}`;
  }
}
