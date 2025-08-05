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

import {
  AuthMethod,
  AuthExtras,
  AuthParams,
  BackupKitEmailProps,
  CurrentWalletIds,
  EmailTheme,
  PartnerEntity,
  PublicKeyStatus,
  PublicKeyType,
  VerificationEmailProps,
  TWalletType,
  WalletParams,
  PregenIds,
  PasswordStatus,
  BiometricLocationHint,
  Auth,
  extractAuthInfo,
  SupportedWalletTypes,
  AuthIdentifier,
  isEmail,
  isPhone,
  isFarcaster,
  isTelegram,
  AuthType,
  ExternalWalletInfo,
  ServerAuthStateVerify,
  ServerAuthStateLogin,
  ServerAuthStateSignup,
  PrimaryAuthInfo,
  toPregenTypeAndId,
  toPregenIds,
  SessionInfo,
  PrimaryAuth,
  PrimaryAuthType,
  isExternalWallet,
  AccountMetadata,
  WALLET_TYPES,
  PregenOrGuestAuth,
  LinkedAccounts,
  VerifyLinkParams,
  TLinkedAccountType,
  LINKED_ACCOUNT_TYPES,
  VerifiedAuth,
  VerifyExternalWalletParams,
  SupportedAccountLinks,
  isPregenAuth,
  VerifiedAuthInfo,
  OnRampPurchase,
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
  SuccessfulSignatureRes,
  DeniedSignatureRes,
  PopupType,
  ParaEvent,
  WalletCreatedResponse,
  PregenWalletClaimedResponse,
  WalletFilters,
  Wallet,
  PortalUrlOptions,
  ConstructorOpts,
  CoreAuthInfo,
  PortalUrlType,
  CoreMethodParams,
  CoreMethodResponse,
  WithUseShortUrls,
  WithCustomTheme,
  AuthStateVerify,
  AuthStateLogin,
  AuthStateSignup,
  NewCredentialUrlParams,
  LoginUrlParams,
  CoreInterface,
  ExternalWalletConnectionType,
  AccountLinkInProgress,
  InternalMethodParams,
  InternalMethodResponse,
  AuthStateSignupOrLogin,
  OAuthResponse,
  AccountLinkError,
} from './types/index.js';
import { PlatformUtils } from './PlatformUtils.js';
import { sendRecoveryForShare } from './shares/recovery.js';
import { CountryCallingCode } from 'libphonenumber-js';
import {
  autoBind,
  formatPhoneNumber,
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
  jsonParse,
  migrateWallet,
  newUuid,
  setupListeners,
  supportedWalletTypesEq,
  truncateAddress,
  WalletSchemeTypeMap,
  shortenUrl,
  isServerAuthState,
  splitPhoneNumber,
} from './utils/index.js';
import { TransactionReviewDenied, TransactionReviewTimeout } from './errors.js';
import * as constants from './constants.js';

type WritableMethodKeys<T> = {
  [K in keyof T]-?: IfEquals<
    { [P in K]: T[K] },
    { -readonly [P in K]: T[K] },
    T[K] extends (...args: any[]) => any ? K : never
  >;
}[keyof T];

type IfEquals<X, Y, A = X, B = never> = X extends Y ? (Y extends X ? A : B) : B;

export abstract class ParaCore implements CoreInterface {
  static version?: string = constants.PARA_CORE_VERSION;

  ctx: Ctx;

  #authInfo?: CoreAuthInfo;

  protected isNativePasskey: boolean = false;

  protected isPartnerOptional?: boolean;

  isReady: boolean = false;

  get authInfo(): CoreAuthInfo | undefined {
    return this.#authInfo;
  }

  get email(): AuthIdentifier<'email'> | undefined {
    return isEmail(this.#authInfo?.auth) ? this.#authInfo.auth.email : undefined;
  }

  get phone(): AuthIdentifier<'phone'> | undefined {
    return isPhone(this.#authInfo?.auth) ? this.#authInfo.auth.phone : undefined;
  }

  get farcasterUsername(): AuthIdentifier<'farcaster'> | undefined {
    return isFarcaster(this.#authInfo?.auth) ? this.#authInfo.auth.farcasterUsername : undefined;
  }

  get telegramUserId(): AuthIdentifier<'telegram'> | undefined {
    return isTelegram(this.#authInfo?.auth) ? this.#authInfo.auth.telegramUserId : undefined;
  }

  get externalWalletWithParaAuth(): Wallet | undefined {
    const externalWallets = Object.values(this.externalWallets);

    return externalWallets.find(w => w.isExternalWithParaAuth);
  }

  get externalWalletConnectionType(): ExternalWalletConnectionType {
    if (this.isExternalWalletAuth) {
      return 'AUTHENTICATED';
    } else if (this.isExternalWalletWithVerification) {
      return 'VERIFICATION';
    } else if (!!Object.keys(this.externalWallets).length) {
      // CONNECTION_ONLY applies for both externalWalletConnectionOnly and standard external wallet connection with Para tracking
      return 'CONNECTION_ONLY';
    }

    return 'NONE';
  }

  protected partner?: PartnerEntity;

  userId?: string;
  accountLinkInProgress: AccountLinkInProgress | undefined = undefined;

  private sessionCookie?: string;

  private isAwaitingAccountCreation = false;
  private isAwaitingLogin = false;
  private isAwaitingFarcaster = false;
  private isAwaitingOAuth = false;
  private isWorkerInitialized = false;

  get isEmail(): boolean {
    return isEmail(this.authInfo?.auth);
  }

  get isPhone(): boolean {
    return isPhone(this.authInfo?.auth);
  }

  get isFarcaster(): boolean {
    return isFarcaster(this.authInfo?.auth);
  }

  get isTelegram(): boolean {
    return isTelegram(this.authInfo?.auth);
  }

  get isExternalWalletAuth(): boolean {
    return isExternalWallet(this.#authInfo?.auth) && !!this.#authInfo?.externalWallet?.withFullParaAuth;
  }

  get isExternalWalletWithVerification(): boolean {
    return isExternalWallet(this.#authInfo?.auth) && !!this.#authInfo?.externalWallet?.withVerification;
  }

  get partnerId(): string | undefined {
    return this.partner?.id;
  }

  protected get partnerName(): string | undefined {
    return this.partner?.displayName;
  }

  protected get partnerLogo(): string | undefined {
    return this.partner?.logoUrl;
  }

  async #assertPartner(): Promise<PartnerEntity> {
    if (!this.partner) {
      await this.touchSession();
    }

    if (this.partner?.cosmosPrefix && this.ctx.cosmosPrefix !== this.partner.cosmosPrefix) {
      this.ctx.cosmosPrefix = this.partner?.cosmosPrefix;
    }

    return this.partner!;
  }

  /**
   * The IDs of the currently active wallets, for each supported wallet type. Any signer integrations will default to the first viable wallet ID in this dictionary.
   */
  currentWalletIds: CurrentWalletIds = {};

  get currentWalletIdsArray(): [string, TWalletType][] {
    return (this.partner?.supportedWalletTypes ?? Object.keys(this.currentWalletIds).map(type => ({ type }))).reduce(
      (acc, { type }) => {
        return [
          ...acc,
          ...(this.currentWalletIds[type] ?? []).map(id => {
            return [id, type];
          }),
        ];
      },
      [],
    );
  }

  get currentWalletIdsUnique(): string[] {
    return [...new Set(Object.values(this.currentWalletIds).flat())];
  }

  get #guestWalletIds(): CurrentWalletIds {
    if (!this.partner?.supportedWalletTypes) {
      return {};
    }

    const guestId = this.pregenIds?.GUEST_ID?.[0];
    return !!guestId
      ? Object.entries(this.wallets).reduce((acc, [id, wallet]) => {
          if (
            wallet.isPregen &&
            !wallet.userId &&
            wallet.pregenIdentifierType === 'GUEST_ID' &&
            wallet.pregenIdentifier === guestId
          ) {
            return {
              ...acc,
              ...getEquivalentTypes(wallet.type)
                .filter(type => this.partner.supportedWalletTypes.some(entry => entry.type === type))
                .reduce((acc, eqType) => ({ ...acc, [eqType]: [...new Set([...(acc[eqType] ?? []), id])] }), {}),
            };
          }
          return acc;
        }, {})
      : {};
  }

  get #guestWalletIdsArray(): [string, TWalletType][] {
    return Object.entries(this.#guestWalletIds).reduce((acc, [type, ids]) => {
      return [...acc, ...ids.map(id => [id, type])];
    }, []);
  }

  /**
   * Wallets associated with the `ParaCore` instance. Retrieve a particular wallet using `para.wallets[walletId]`.
   */
  wallets: Record<string, Wallet>;

  /**
   * Wallets associated with the `ParaCore` instance.
   */
  externalWallets: Record<string, Wallet> = {};

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
    return this.currentWalletIdsArray.length > 1 || this.#guestWalletIdsArray.length > 1;
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

  /**
   * Whether or not to treat external wallets as connections only, skipping all Para functionality.
   */
  externalWalletConnectionOnly?: boolean;

  private disableProviderModal?: boolean;

  private fetchPregenWalletsOverride?: ConstructorOpts['fetchPregenWalletsOverride'];

  get isNoWalletConfig(): boolean {
    return !!this.partner?.supportedWalletTypes && this.partner.supportedWalletTypes.length === 0;
  }

  get supportedWalletTypes(): SupportedWalletTypes {
    return this.partner?.supportedWalletTypes ?? [];
  }

  get cosmosPrefix(): string | undefined {
    return this.partner?.cosmosPrefix;
  }

  get supportedAccountLinks(): SupportedAccountLinks {
    return this.partner?.supportedAccountLinks ?? [...LINKED_ACCOUNT_TYPES];
  }

  get isWalletTypeEnabled(): Partial<Record<TWalletType, boolean>> {
    return (this.partner?.supportedWalletTypes || []).reduce((acc, { type }) => {
      return { ...acc, [type]: true };
    }, {});
  }

  protected onRampPopup:
    | {
        window: Window;
        onRampPurchase: OnRampPurchase;
      }
    | undefined = undefined;

  protected platformUtils: PlatformUtils;

  private localStorageGetItem = (key: string): Promise<string | null> | string | null => {
    return this.platformUtils.localStorage.get(key);
  };
  private localStorageSetItem = (key: string, value: string): Promise<void> | void => {
    return this.platformUtils.localStorage.set(key, value);
  };
  private localStorageRemoveItem = (key: string): Promise<void> | void => {
    return this.platformUtils.localStorage.removeItem(key);
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
  clearStorage = async (type: CoreMethodParams<'clearStorage'> = 'all'): CoreMethodResponse<'clearStorage'> => {
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

  protected isPortal(envOverride?: Environment): boolean {
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
      !this.partner?.supportedWalletTypes ||
      isWalletSupported(this.partner.supportedWalletTypes.map(({ type }) => type) ?? [], wallet)
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

    if (this.externalWallets?.[walletId]) {
      return true;
    }

    if (!this.wallets[walletId]) {
      error = `wallet with id ${walletId} does not exist`;
    } else {
      const wallet = this.wallets[walletId];

      const [isUnclaimed, isOwned] = [this.isPregenWalletUnclaimed(wallet), this.isWalletOwned(wallet)];

      if (forbidPregen && isUnclaimed && wallet.pregenIdentifierType !== 'GUEST_ID') {
        error = `pre-generated wallet with id ${wallet?.id} cannot be selected`;
      } else if (!isOwned && !isUnclaimed) {
        error = `wallet with id ${wallet?.id} is not owned by the current user`;
      } else if (!this.isWalletSupported(wallet)) {
        error = `wallet with id ${wallet.id} and type ${wallet.type} is not supported, supported types are: ${(this.partner?.supportedWalletTypes || []).map(({ type }) => type).join(', ')}`;
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
   * @param {TWalletType} options.addressType the type of address to display.
   * @returns the formatted address
   */
  getDisplayAddress(
    walletId: string,
    options:
      | { truncate?: boolean; addressType?: TWalletType | undefined; cosmosPrefix?: string; targetLength?: number }
      | undefined = {},
  ): string {
    if (this.externalWallets[walletId]) {
      const wallet = this.externalWallets[walletId];

      return options.truncate
        ? truncateAddress(wallet.address, wallet.type, {
            prefix: this.partner?.cosmosPrefix,
            targetLength: options.targetLength,
          })
        : wallet.address;
    }

    const wallet = this.findWallet(walletId, options.addressType);

    if (!wallet) {
      return undefined;
    }

    let str: string;
    let prefix: string;

    switch (wallet.type) {
      case 'COSMOS':
        prefix = options.cosmosPrefix ?? this.partner?.cosmosPrefix ?? 'cosmos';
        str = getCosmosAddress(wallet.publicKey!, prefix);
        break;
      default:
        prefix = this.cosmosPrefix;
        str = wallet.address;
        break;
    }

    return options.truncate ? truncateAddress(str, wallet.type, { prefix, targetLength: options.targetLength }) : str;
  }

  /**
   * Returns a unique hash for a wallet suitable for use as an identicon seed.
   * @param {string} walletId the ID of the wallet.
   * @param {boolean} options.addressType used to format the hash for another wallet type.
   * @returns the identicon hash string
   */
  getIdenticonHash(walletId: string, overrideType?: TWalletType): string | undefined {
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

  abstract isPasskeySupported(): Promise<boolean>;

  protected async constructPortalUrl(type: PortalUrlType, opts: PortalUrlOptions = {}) {
    const [isCreate, isLogin, isOnRamp] = [
      ['createAuth', 'createPassword'].includes(type),
      ['loginAuth', 'loginPassword'].includes(type),
      type === 'onRamp',
    ];

    if (isCreate || isLogin) {
      this.assertIsAuthSet();
    }

    let sessionId = opts.sessionId;
    if ((isLogin || isOnRamp) && !sessionId) {
      const session = await this.touchSession(true);

      sessionId = session.sessionId;
    }

    if (!this.loginEncryptionKeyPair) {
      await this.setLoginEncryptionKeyPair();
    }

    const base =
      type === 'onRamp' || type === 'telegramLogin'
        ? getPortalBaseURL(this.ctx, type === 'telegramLogin')
        : await this.getPortalURL();

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
        path = `/web/users/${this.userId}/on-ramp-transaction/v2/${opts.pathId}`;
        break;
      }
      case 'telegramLogin': {
        path = `/auth/telegram`;
        break;
      }
      default: {
        throw new Error(`invalid URL type ${type}`);
      }
    }

    let partner: PartnerEntity | undefined = undefined;
    try {
      partner = await this.#assertPartner();
    } catch (e) {
      if (this.isPartnerOptional) {
        partner = undefined;
      } else {
        throw e;
      }
    }

    const thisDevice = opts.thisDevice ?? {
      encryptionKey: getPublicKeyHex(this.loginEncryptionKeyPair),
      sessionId,
    };

    const params: Record<string, string | undefined | null> = {
      apiKey: this.ctx.apiKey,
      partnerId: partner?.id,
      portalFont: opts.portalTheme?.font || partner?.font || this.portalTheme?.font,
      portalBorderRadius: opts.portalTheme?.borderRadius || this.portalTheme?.borderRadius,
      portalThemeMode: opts.portalTheme?.mode || partner?.themeMode || this.portalTheme?.mode,
      portalAccentColor: opts.portalTheme?.accentColor || partner?.accentColor || this.portalTheme?.accentColor,
      portalForegroundColor:
        opts.portalTheme?.foregroundColor || partner?.foregroundColor || this.portalTheme?.foregroundColor,
      portalBackgroundColor:
        opts.portalTheme?.backgroundColor ||
        partner?.backgroundColor ||
        this.portalBackgroundColor ||
        this.portalTheme?.backgroundColor,
      portalPrimaryButtonColor: this.portalPrimaryButtonColor,
      portalTextColor: this.portalTextColor,
      portalPrimaryButtonTextColor: this.portalPrimaryButtonTextColor,
      isForNewDevice: opts.isForNewDevice ? opts.isForNewDevice.toString() : undefined,
      ...(isCreate || isLogin
        ? {
            authInfo: JSON.stringify(this.authInfo),
            ...(isPhone(this.authInfo.auth) ? splitPhoneNumber(this.authInfo.auth.phone) : this.authInfo.auth),
            pfpUrl: this.authInfo.pfpUrl,
            displayName: this.authInfo.displayName,
          }
        : {}),
      ...(isOnRamp ? { origin: typeof window !== 'undefined' ? window.location.origin : undefined, email: this.email } : {}),
      ...(isLogin
        ? {
            sessionId: thisDevice.sessionId,
            encryptionKey: thisDevice.encryptionKey,
            ...(opts.newDevice
              ? {
                  newDeviceSessionLookupId: opts.newDevice.sessionId,
                  newDeviceEncryptionKey: opts.newDevice.encryptionKey,
                }
              : {}),
            pregenIds: JSON.stringify(this.pregenIds),
          }
        : {}),
      ...(type === 'telegramLogin' ? { isEmbed: 'true' } : {}),
      ...(opts.params || {}),
    };

    const url = constructUrl({ base, path, params });

    if (opts.shorten) {
      return shortenUrl(this.ctx, url);
    }

    return url;
  }

  #toAuthInfo({
    email,
    phone,
    countryCode,
    farcasterUsername,
    telegramUserId,
    externalWalletAddress,
  }: { [key in keyof Omit<AuthParams, 'userId'>]: string | null | undefined }): CoreAuthInfo | undefined {
    let auth;

    switch (true) {
      case !!email:
        auth = { email };
        break;
      case !!phone:
        {
          const validPhone = formatPhoneNumber(phone, countryCode);

          if (validPhone) auth = { phone: formatPhoneNumber(phone, countryCode) };
        }
        break;
      case !!farcasterUsername:
        auth = { farcasterUsername };
        break;
      case !!telegramUserId:
        auth = { telegramUserId };
        break;
      case !!externalWalletAddress:
        auth = { externalWalletAddress };
        break;
    }

    return extractAuthInfo(auth);
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

    let isE2E = false;
    if (env === ('E2E' as Environment)) {
      isE2E = true;
      env = Environment.SANDBOX;
    }

    this.externalWalletConnectionOnly = opts.externalWalletConnectionOnly;

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
    this.fetchPregenWalletsOverride = opts.fetchPregenWalletsOverride;

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
      isE2E,
    };
    if (opts.offloadMPCComputationURL) {
      this.ctx.mpcComputationClient = mpcComputationClient.initClient(opts.offloadMPCComputationURL, opts.disableWorkers);
    }

    if (!this.platformUtils.isSyncStorage || opts.useStorageOverrides) {
      return;
    }
    this.initializeFromStorage();

    setupListeners.bind(this)();

    // Auto bind all functions to the instance so the instance can be destructured i.e. in the react-sdk
    autoBind(this);

    // start with non-prod to make sure error tracking is working properly
    if (env !== Environment.PROD) {
      this.wrapMethodsWithErrorTracking([
        'signUpOrLogIn',
        'verifyNewAccount',
        'waitForLogin',
        'waitForSignup',
        'waitForWalletCreation',
        'verifyOAuth',
        'verifyTelegram',
        'verifyFarcaster',
        'createPregenWallet',
        'claimPregenWallets',
        'signMessage',
        'signTransaction',
      ]);
    }
  }

  private trackError = async (methodName: string, err: Error) => {
    try {
      await this.ctx.client.trackError({
        methodName,
        sdkType: this.platformUtils.sdkType,
        userId: this.userId,
        error: {
          name: err.name,
          message: err.message,
        },
      });
    } catch (e) {
      console.error('error tracking error:', e);
    }

    throw err;
  };

  private wrapMethodsWithErrorTracking = (methodNames: WritableMethodKeys<ParaCore>[]) => {
    for (const methodName of methodNames) {
      const original = this[methodName];
      if (typeof original === 'function') {
        this[methodName] = (...args: any[]) => {
          try {
            const result = original.apply(this, args);
            return result instanceof Promise ? result.catch(err => this.trackError(methodName, err)) : result;
          } catch (err) {
            return this.trackError(methodName, err);
          }
        };
      }
    }
  };

  private initializeFromStorage = () => {
    // Loading external wallets before auth so we can check for any full auth wallets
    this.updateExternalWalletsFromStorage();
    this.updateAuthInfoFromStorage();
    this.updateUserIdFromStorage();
    this.updateWalletsFromStorage();
    this.updateWalletIdsFromStorage();
    this.updateSessionCookieFromStorage();
    this.updateLoginEncryptionKeyPairFromStorage();
  };

  private updateAuthInfoFromStorage = () => {
    const storageAuthInfo = (this.localStorageGetItem(constants.LOCAL_STORAGE_AUTH_INFO) as string) || undefined;

    let authInfo = jsonParse<CoreAuthInfo>(storageAuthInfo);

    if (!authInfo) {
      const authParams = {
        email: (this.localStorageGetItem(constants.LOCAL_STORAGE_EMAIL) as string) || undefined,
        phone: (this.localStorageGetItem(constants.LOCAL_STORAGE_PHONE) as string) || undefined,
        countryCode: (this.localStorageGetItem(constants.LOCAL_STORAGE_COUNTRY_CODE) as CountryCallingCode) || undefined,
        farcasterUsername: (this.localStorageGetItem(constants.LOCAL_STORAGE_FARCASTER_USERNAME) as string) || undefined,
        telegramUserId: (this.localStorageGetItem(constants.LOCAL_STORAGE_TELEGRAM_USER_ID) as string) || undefined,
        // Using id here since we store the bech32 address for cosmos in the address field of the wallet
        externalWalletAddress: this.externalWalletWithParaAuth?.id || undefined,
      };

      authInfo = this.#toAuthInfo(authParams);
    }

    this.#authInfo = authInfo;
  };

  private updateUserIdFromStorage = () => {
    this.userId = (this.localStorageGetItem(constants.LOCAL_STORAGE_USER_ID) as string) || undefined;
  };

  private updateWalletsFromStorage = async () => {
    // TODO: Improve not great check
    const _currentWalletIds = (this.localStorageGetItem(constants.LOCAL_STORAGE_CURRENT_WALLET_IDS) as string) ?? undefined;
    const currentWalletIds = [undefined, null, 'undefined'].includes(_currentWalletIds)
      ? {}
      : (() => {
          const fromJson = JSON.parse(_currentWalletIds);

          return Array.isArray(fromJson)
            ? WALLET_TYPES.reduce((acc: CurrentWalletIds, type: TWalletType) => {
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
    const currentWalletIds = [undefined, null, 'undefined', 'null'].includes(_currentWalletIds)
      ? {}
      : (() => {
          const fromJson = JSON.parse(_currentWalletIds);

          return Array.isArray(fromJson)
            ? WALLET_TYPES.reduce((acc: CurrentWalletIds, type: TWalletType) => {
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

  protected initializeWorker = async () => {
    if (!this.isWorkerInitialized && !this.ctx.disableWebSockets && !this.ctx.disableWorkers) {
      try {
        // we only want to try to initialize the worker once, it will automatically be initialized when needed if this fails
        this.isWorkerInitialized = true;
        await this.platformUtils.initializeWorker(this.ctx);
      } catch (e) {
        this.devLog('error initializing worker:', e);
      }
    }
  };

  async touchSession(regenerate = false): Promise<SessionInfo> {
    if (!this.isWorkerInitialized) {
      // no await here to avoid blocking this call
      this.initializeWorker();
    }

    if (!this.isReady) {
      await this.ready();
    }

    const session = await this.ctx.client.touchSession(regenerate);

    if (
      !this.partner ||
      this.partner?.id !== session.partnerId ||
      !supportedWalletTypesEq(this.partner?.supportedWalletTypes || [], session.supportedWalletTypes) ||
      (this.partner?.cosmosPrefix || 'cosmos') !== session.cosmosPrefix
    ) {
      await this.#getPartner(session.partnerId);
    }

    return session;
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
    this.userId = ((await this.localStorageGetItem(constants.LOCAL_STORAGE_USER_ID)) as string) || undefined;

    const storageAuthInfo = ((await this.localStorageGetItem(constants.LOCAL_STORAGE_AUTH_INFO)) as string) || undefined;

    // Loading external wallets before auth so we can check for any full auth wallets
    const stringExternalWallets = await this.localStorageGetItem(constants.LOCAL_STORAGE_EXTERNAL_WALLETS);
    const _externalWallets = JSON.parse((stringExternalWallets as string) || '{}');

    await this.setExternalWallets(_externalWallets);

    let authInfo = jsonParse<CoreAuthInfo>(storageAuthInfo);

    if (!authInfo) {
      const authParams = {
        email: ((await this.localStorageGetItem(constants.LOCAL_STORAGE_EMAIL)) as string) || undefined,
        phone: ((await this.localStorageGetItem(constants.LOCAL_STORAGE_PHONE)) as string) || undefined,
        countryCode:
          ((await this.localStorageGetItem(constants.LOCAL_STORAGE_COUNTRY_CODE)) as CountryCallingCode) || undefined,
        farcasterUsername:
          ((await this.localStorageGetItem(constants.LOCAL_STORAGE_FARCASTER_USERNAME)) as string) || undefined,
        telegramUserId: ((await this.localStorageGetItem(constants.LOCAL_STORAGE_TELEGRAM_USER_ID)) as string) || undefined,
        // Using id here since we store the bech32 address for cosmos in the address field of the wallet
        externalWalletAddress: this.externalWalletWithParaAuth?.id || undefined,
      };

      authInfo = this.#toAuthInfo(authParams);
    }

    this.#authInfo = authInfo;

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
            ? WALLET_TYPES.reduce((acc: CurrentWalletIds, type: TWalletType) => {
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

    setupListeners.bind(this)();

    await this.touchSession();
  }

  /**
   * Call this method to perform initial setup for the `ParaCore` instance.
   *
   * This method will be called automatically if you use the React `ParaProvider` or when you call any methods that request an updated session.
   */
  abstract ready(): Promise<void>;

  async #setAuthInfo(authInfo: CoreAuthInfo): Promise<void> {
    this.#authInfo = authInfo;
    await this.localStorageSetItem(constants.LOCAL_STORAGE_AUTH_INFO, JSON.stringify(authInfo));
    await this.localStorageRemoveItem(constants.LOCAL_STORAGE_EMAIL);
    await this.localStorageRemoveItem(constants.LOCAL_STORAGE_PHONE);
    await this.localStorageRemoveItem(constants.LOCAL_STORAGE_COUNTRY_CODE);
    await this.localStorageRemoveItem(constants.LOCAL_STORAGE_FARCASTER_USERNAME);
    await this.localStorageRemoveItem(constants.LOCAL_STORAGE_TELEGRAM_USER_ID);
  }

  protected async setAuth(
    auth: PrimaryAuth,
    { extras = {}, userId }: { extras?: AuthExtras; userId?: string } = {},
  ): Promise<typeof this.authInfo> {
    const authInfo = {
      ...extractAuthInfo(auth, { isRequired: true }),
      ...(extras || {}),
    };

    await this.#setAuthInfo(authInfo);

    if (!!userId) {
      await this.setUserId(userId);
    }

    return this.#authInfo;
  }

  protected assertUserId({ allowGuestMode = false }: { allowGuestMode?: boolean } = {}): string {
    if (!this.userId || (!allowGuestMode && this.isGuestMode)) {
      throw new Error('no userId is set');
    }

    return this.userId;
  }

  protected assertIsAuthSet(allowed?: AuthType[]): PrimaryAuthInfo {
    if (!this.#authInfo) {
      throw new Error('auth is not set');
    }

    if (allowed && !allowed.includes(this.#authInfo.authType)) {
      throw new Error(`invalid auth type, expected ${allowed.join(', ')}`);
    }

    return this.#authInfo;
  }

  /**
   * Sets the email associated with the `ParaCore` instance.
   * @param email - Email to set.
   */
  async setEmail(email: string): Promise<void> {
    await this.setAuth({ email });
  }

  /**
   * Sets the Telegram user ID associated with the `ParaCore` instance.
   * @param telegramUserId - Telegram user ID to set.
   */
  async setTelegramUserId(telegramUserId: string): Promise<void> {
    await this.setAuth({ telegramUserId });
  }

  /**
   * Sets the phone number associated with the `ParaCore` instance.
   * @param phone - Phone number to set.
   * @param countryCode - Country Code to set.
   */
  async setPhoneNumber(phone: `+${number}` | string, countryCode?: string): Promise<void> {
    await this.setAuth({ phone: formatPhoneNumber(phone, countryCode) });
  }

  /**
   * Sets the farcaster username associated with the `ParaCore` instance.
   * @param farcasterUsername - Farcaster Username to set.
   */
  async setFarcasterUsername(farcasterUsername: string): Promise<void> {
    await this.setAuth({ farcasterUsername });
  }

  /**
   * Sets the external wallet address and type associated with the `ParaCore` instance.
   * @param externalAddress - External wallet address to set.
   * @param externalType - Type of external wallet to set.
   */
  async setExternalWallet(externalWallet: ExternalWalletInfo[] | ExternalWalletInfo): Promise<void> {
    const { id: partnerId, supportedWalletTypes } = await this.#assertPartner();
    // Can change this to continue storing existing external wallets if/when we want to allow multiple connected external wallets
    (this.externalWallets = (Array.isArray(externalWallet) ? externalWallet : [externalWallet]).reduce(
      (
        acc: Record<string, Wallet>,
        {
          partnerId: wPartnerId,
          address,
          type,
          provider,
          providerId,
          addressBech32,
          withFullParaAuth,
          isConnectionOnly,
          withVerification,
        },
      ) => {
        if (partnerId === wPartnerId && supportedWalletTypes.some(({ type: supportedType }) => supportedType === type)) {
          return {
            ...acc,
            [address]: {
              id: address,
              partnerId,
              address: addressBech32 ?? address,
              type,
              name: provider,
              isExternal: true,
              isExternalWithParaAuth: withFullParaAuth,
              externalProviderId: providerId,
              signer: '',
              isExternalConnectionOnly: isConnectionOnly,
              isExternalWithVerification: withVerification,
            },
          };
        }
        return acc;
      },
      {},
    )),
      this.setExternalWallets(this.externalWallets);
    dispatchEvent(ParaEvent.EXTERNAL_WALLET_CHANGE_EVENT, null);
  }

  protected async addExternalWallets(externalWallets: ExternalWalletInfo[]) {
    const { id: partnerId, supportedWalletTypes } = await this.#assertPartner();
    // Can change this to continue storing existing external wallets if/when we want to allow multiple connected external wallets
    this.externalWallets = {
      ...Object.entries(this.externalWallets).reduce((acc: Record<string, Wallet>, [address, wallet]) => {
        if (partnerId === wallet.partnerId && supportedWalletTypes.some(({ type }) => type === wallet.type)) {
          return {
            ...acc,
            [address]: wallet,
          };
        }
        return acc;
      }, {}),
      ...externalWallets.reduce(
        (
          acc: Record<string, Wallet>,
          { address, type, provider, providerId, addressBech32, withFullParaAuth, isConnectionOnly, withVerification },
        ) => {
          return {
            ...acc,
            [address]: {
              id: address,
              partnerId,
              address: addressBech32 ?? address,
              type,
              name: provider,
              isExternal: true,
              isExternalWithParaAuth: withFullParaAuth,
              externalProviderId: providerId,
              signer: '',
              isExternalConnectionOnly: isConnectionOnly,
              isExternalWithVerification: withVerification,
            },
          };
        },
        {},
      ),
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

  getAuthInfo(): CoreAuthInfo | undefined {
    return this.authInfo;
  }

  /**
   * Gets the email associated with the `ParaCore` instance.
   * @returns - email associated with the `ParaCore` instance.
   */
  getEmail(): string | undefined {
    return this.email;
  }

  /**
   * Gets the formatted phone number associated with the `ParaCore` instance.
   * @returns - formatted phone number associated with the `ParaCore` instance.
   */
  getPhoneNumber(): `+${number}` | undefined {
    return this.phone;
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
   * Fetches the most recent OAuth account metadata for the signed-in user.
   * If applicable, this will include the user's most recent metadata from their Google, Apple, Facebook, X, Discord, Farcaster, or Telegram account, the last time they signed in to your app.
   * @deprecated use `para.getLinkedAccounts({ withMetadata: true })` instead.
   * @returns {Promise<AccountMetadata>} the user's account metadata.
   */
  async getAccountMetadata(): Promise<AccountMetadata> {
    if (!(await this.isSessionActive()) || !this.userId) {
      throw new Error('no signed-in user');
    }
    const { partnerId } = await this.touchSession();
    const { accountMetadata } = await this.ctx.client.getAccountMetadata(this.userId, partnerId);

    return accountMetadata;
  }

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
        if (address.toLowerCase() === this.getDisplayAddress(id, { addressType: <TWalletType>type }).toLowerCase()) {
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
    overrideType?: TWalletType,
    filter: WalletFilters = {},
  ): Omit<Wallet, 'signer'> | undefined {
    // Only default to the external wallet if we're not using external wallet auth
    if (!this.isExternalWalletAuth) {
      if (!idOrAddress && Object.keys(this.externalWallets).length > 0) {
        return Object.values(this.externalWallets)[0];
      }
    }

    if (this.externalWallets?.[idOrAddress]) {
      return this.externalWallets[idOrAddress];
    }

    try {
      const walletId = this.findWalletId(idOrAddress, filter);

      if (walletId && !!this.wallets[walletId]) {
        const { signer: _signer, ...wallet } = this.wallets[walletId];
        const type = overrideType ?? this.currentWalletIdsArray.find(([id]) => id === walletId)?.[1] ?? wallet.type;

        return {
          ...wallet,
          type,
        };
      }
    } catch (e) {
      return undefined;
    }
  }

  get availableWallets(): Pick<
    Wallet,
    'id' | 'type' | 'name' | 'address' | 'isExternal' | 'externalProviderId' | 'isExternalConnectionOnly'
  >[] {
    return [
      ...[...this.currentWalletIdsArray, ...this.#guestWalletIdsArray]
        .map(([address, type]): [string, TWalletType, boolean] => [address, type, false])
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
  getWalletsByType(type: CoreMethodParams<'getWalletsByType'>): CoreMethodResponse<'getWalletsByType'> {
    return Object.values(this.wallets).filter(w => this.isWalletUsable(w.id, { type: [type] }));
  }

  private assertIsValidWalletId(walletId: string, condition: WalletFilters = {}): void {
    this.isWalletUsable(walletId, condition, true);
  }

  private async assertIsValidWalletType(type: string, walletTypes?: TWalletType[]): Promise<TWalletType> {
    const { supportedWalletTypes } = await this.#assertPartner();

    if (
      !type ||
      !WALLET_TYPES.includes(<TWalletType>type) ||
      !(walletTypes ?? supportedWalletTypes.map(({ type }) => type)).includes(<TWalletType>type)
    ) {
      throw new Error(`wallet type ${type} is not supported`);
    }

    return <TWalletType>type;
  }

  private async getMissingTypes(): Promise<TWalletType[]> {
    const { supportedWalletTypes } = await this.#assertPartner();

    return <TWalletType[]>(
      supportedWalletTypes
        .filter(
          ({ type: t, optional }) =>
            !optional && Object.values(this.wallets).every(w => !this.isWalletOwned(w) || !WalletSchemeTypeMap[w.scheme][t]),
        )
        .map(({ type }) => type)
    );
  }

  private async getTypesToCreate(types?: Uppercase<TWalletType>[]): Promise<TWalletType[]> {
    const { supportedWalletTypes } = await this.#assertPartner();

    return getSchemes(types ?? (await this.getMissingTypes())).map(scheme => {
      switch (scheme) {
        case 'ED25519':
          return 'SOLANA';
        default:
          return supportedWalletTypes.some(({ type, optional }) => type === 'COSMOS' && !optional) ? 'COSMOS' : 'EVM';
      }
    });
  }

  async #getPartner(partnerId: string): Promise<PartnerEntity> {
    if (this.isPartnerOptional && !partnerId) {
      return undefined;
    }

    const res = await this.ctx.client.getPartner(partnerId);

    this.partner = res.data.partner;

    return this.partner;
  }

  private async getPartnerURL(): Promise<string | undefined> {
    try {
      const { portalUrl } = await this.#assertPartner();
      return portalUrl;
    } catch (e) {
      if (this.isPartnerOptional) {
        return undefined;
      }
      throw e;
    }
  }

  /**
   * URL of the portal, which can be associated with a partner id
   * @param partnerId: string - id of the partner to get the portal URL for
   * @returns - portal URL
   */
  protected async getPortalURL(): Promise<string> {
    return (await this.getPartnerURL()) || getPortalBaseURL(this.ctx);
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
    if (wallet.scheme !== 'DKLS') {
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
  async fetchWallets(): CoreMethodResponse<'fetchWallets'> {
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
   * Logs in or creates a new user using an external wallet address.
   * @param {Object} opts the options object
   * @param {string} opts.address the external wallet address to use for identification.
   * @param {TWalletType} opts.type type of external wallet to use for identification.
   * @param {string} opts.provider the name of the provider for the external wallet.
   */
  async loginExternalWallet({
    externalWallet,
    ...urlOptions
  }: CoreMethodParams<'loginExternalWallet'>): CoreMethodResponse<'loginExternalWallet'> {
    const externalWallets = Array.isArray(externalWallet) ? externalWallet : [externalWallet];

    if (this.externalWalletConnectionOnly || externalWallets.every(wallet => wallet.isConnectionOnly)) {
      // withFullParaAuth cannot be used if using connection only wallets
      await this.addExternalWallets(
        externalWallets.map(wallet => ({
          ...wallet,
          withFullParaAuth: false,
        })),
      );
      return Promise.resolve({
        userId: constants.EXTERNAL_WALLET_CONNECTION_ONLY_USER_ID,
      }) as CoreMethodResponse<'loginExternalWallet'>;
    }

    if (Array.isArray(externalWallet)) {
      throw new Error(
        'Cannot authenticate multiple external wallets at once. To connect multiple wallets at once, use CONNECTION_ONLY mode.',
      );
    }

    this.requireApiKey();

    const serverAuthState = await this.ctx.client.loginExternalWallet({ externalWallet });

    if (!externalWallet.withFullParaAuth && externalWallet.withVerification) {
      await this.touchSession(true);
    }

    return this.#prepareAuthState(serverAuthState, urlOptions);
  }

  async verifyExternalWallet({
    externalWallet,
    signedMessage,
    cosmosPublicKeyHex,
    cosmosSigner,
    ...urlOptions
  }: CoreMethodParams<'verifyExternalWallet'>): CoreMethodResponse<'verifyExternalWallet'> {
    const serverAuthState = await this.ctx.client.verifyExternalWallet(this.userId, {
      externalWallet,
      signedMessage,
      cosmosPublicKeyHex,
      cosmosSigner,
    });

    return this.#prepareAuthState(serverAuthState, urlOptions);
  }

  protected async verifyExternalWalletLink(
    opts: InternalMethodParams<'verifyExternalWalletLink'>,
  ): InternalMethodResponse<'verifyExternalWalletLink'> {
    const accountLinkInProgress = await this.#assertIsLinkingAccount(['EXTERNAL_WALLET']);

    if (!accountLinkInProgress.externalWallet) {
      throw new Error('no external wallet account link in progress');
    }

    const accounts = await this.verifyLink({
      accountLinkInProgress,
      externalWallet: accountLinkInProgress!.externalWallet,
      ...opts,
    });

    return accounts;
  }

  protected async verifyTelegramProcess(
    opts: CoreMethodParams<'verifyTelegram'> & { isLinkAccount: false },
  ): CoreMethodResponse<'verifyTelegram'>;
  protected async verifyTelegramProcess(
    opts: InternalMethodParams<'verifyTelegramLink'> & { isLinkAccount: true },
  ): InternalMethodResponse<'verifyTelegramLink'>;

  /**
   * Validates the response received from an attempted Telegram login for authenticity, then
   * creates or retrieves the corresponding Para user and prepares the Para instance to sign in with that user.
   * @param authResponse - the response JSON object received from the Telegram widget.
   * @returns `{ isValid: boolean; telegramUserId?: string; userId?: string; isNewUser?: boolean; supportedAuthMethods?: AuthMethod[]; biometricHints?: BiometricLocationHint[] }`
   */
  protected async verifyTelegramProcess({
    telegramAuthResponse,
    isLinkAccount,
    ...urlOptions
  }: { isLinkAccount: boolean } & (
    | CoreMethodParams<'verifyTelegram'>
    | InternalMethodParams<'verifyTelegramLink'>
  )): Promise<OAuthResponse | LinkedAccounts> {
    try {
      switch (isLinkAccount) {
        case false: {
          const serverAuthState = await this.ctx.client.verifyTelegram(telegramAuthResponse);

          return this.#prepareAuthState(serverAuthState, urlOptions);
        }
        case true: {
          const accountLinkInProgress = await this.#assertIsLinkingAccountOrStart('TELEGRAM');

          const accounts = await this.verifyLink({
            accountLinkInProgress,
            telegramAuthResponse,
          });

          return accounts;
        }
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async verifyTelegram(opts: CoreMethodParams<'verifyTelegram'>): CoreMethodResponse<'verifyTelegram'> {
    return await this.verifyTelegramProcess({ ...opts, isLinkAccount: false });
  }

  protected async verifyTelegramLink(
    opts: InternalMethodParams<'verifyTelegramLink'>,
  ): InternalMethodResponse<'verifyTelegramLink'> {
    return await this.verifyTelegramProcess({ ...opts, isLinkAccount: true });
  }

  /**
   * Performs 2FA verification.
   * @param {Object} opts the options object
   * @param {string} opts.email the email to use for performing a 2FA verification.
   * @param {string} opts.verificationCode the verification code to received via 2FA.
   * @returns {Object} `{ address, initiatedAt, status, userId, walletId }`
   */
  async verify2fa({ auth, verificationCode }: CoreMethodParams<'verify2fa'>): CoreMethodResponse<'verify2fa'> {
    const res = await this.ctx.client.verify2FA(auth, verificationCode);
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
  async setup2fa(): CoreMethodResponse<'setup2fa'> {
    const userId = this.assertUserId();

    const res = await this.ctx.client.setup2FA(userId);

    return res;
  }

  /**
   * Enables 2FA.
   * @param {Object} opts the options object
   * @param {string} opts.verificationCode - the verification code received via 2FA.
   */
  async enable2fa({ verificationCode }: CoreMethodParams<'enable2fa'>): CoreMethodResponse<'enable2fa'> {
    const userId = this.assertUserId();

    await this.ctx.client.enable2FA(userId, verificationCode);
  }

  /**
   * Resend a verification email for the current user.
   */
  async resendVerificationCode({
    type: reason = 'SIGNUP',
  }: CoreMethodParams<'resendVerificationCode'>): CoreMethodResponse<'resendVerificationCode'> {
    let type: 'EMAIL' | 'PHONE', linkedAccountId;
    switch (reason) {
      case 'SIGNUP':
        {
          const authInfo = this.assertIsAuthSet(['email', 'phone']) as VerifiedAuthInfo;
          type = authInfo.authType.toUpperCase() as 'EMAIL' | 'PHONE';
        }
        break;
      case 'LINK_ACCOUNT':
        {
          const accountLinkInProgress = this.#assertIsLinkingAccount(['EMAIL', 'PHONE']);
          linkedAccountId = accountLinkInProgress.id;
          type = accountLinkInProgress.type as 'EMAIL' | 'PHONE';
        }
        break;
    }
    const userId = this.assertUserId({ allowGuestMode: true });

    if (type !== 'EMAIL' && type !== 'PHONE') {
      throw new Error('invalid auth type for verification code');
    }

    await this.ctx.client.resendVerificationCode({
      userId,
      type,
      linkedAccountId,
      ...this.getVerificationEmailProps(),
    });
  }

  /**
   * Checks if the current session is active.
   * @returns `true` if active, `false` otherwise
   */
  async isSessionActive(): CoreMethodResponse<'isSessionActive'> {
    if (this.externalWalletConnectionType === 'CONNECTION_ONLY') {
      return true;
    }

    const { isAuthenticated, verifiedExternalWalletAddresses } = await this.touchSession();

    if (this.externalWalletConnectionType === 'VERIFICATION') {
      if (!verifiedExternalWalletAddresses) {
        return false;
      }

      const externalAddresses = Object.values(this.externalWallets).map(w => w.id);
      return externalAddresses.every(address => verifiedExternalWalletAddresses.includes(address));
    }

    return !!isAuthenticated;
  }

  /**
   * Checks if a session is active and a wallet exists.
   * @returns `true` if active, `false` otherwise
   **/
  async isFullyLoggedIn(): CoreMethodResponse<'isFullyLoggedIn'> {
    if (this.externalWalletConnectionType === 'CONNECTION_ONLY') {
      if (!this.isReady) {
        await this.ready();
      }

      return true;
    }

    if (this.isGuestMode) {
      return true;
    }

    const isSessionActive = await this.isSessionActive();

    if (this.externalWalletConnectionType === 'VERIFICATION') {
      return isSessionActive;
    }

    return (
      isSessionActive &&
      (this.isNoWalletConfig ||
        (this.currentWalletIdsArray.length > 0 &&
          this.currentWalletIdsArray.reduce((acc, [id]) => acc && !!this.wallets[id], true)))
    );
  }

  #assertIsLinkingAccount(types?: TLinkedAccountType[]): AccountLinkInProgress {
    if (!this.accountLinkInProgress || this.accountLinkInProgress.isComplete) {
      throw new Error('no account linking in progress');
    }

    if (types && !types.includes(this.accountLinkInProgress.type)) {
      throw new Error(
        `account linking in progress for type ${this.accountLinkInProgress.type}, expected one of ${types.join(', ')}`,
      );
    }

    return this.accountLinkInProgress;
  }

  async #assertIsLinkingAccountOrStart(type: TLinkedAccountType): Promise<AccountLinkInProgress> {
    if (this.accountLinkInProgress && !this.accountLinkInProgress.isComplete) {
      return this.#assertIsLinkingAccount([type]);
    }

    return await this.linkAccount({ type });
  }

  get isGuestMode(): boolean {
    return (
      this.#guestWalletIdsArray.length > 0 &&
      Object.values(this.wallets).every(
        ({ userId, partnerId }) => partnerId === this.partner?.id && (!userId || userId !== this.userId),
      )
    );
  }

  protected async supportedAuthMethods(auth: Auth<PrimaryAuthType | 'userId'>): Promise<Set<AuthMethod>> {
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
   * @deprecated
   * @returns Array containing useragents and AAGuids for stored biometrics
   */
  protected async getUserBiometricLocationHints(): Promise<BiometricLocationHint[]> {
    const { auth } = this.assertIsAuthSet();

    return await this.ctx.client.getBiometricLocationHints(auth);
  }

  /**
   * Waits for the session to be active.
   **/
  async waitForSignup({
    isCanceled = () => false,
    onCancel,
    onPoll,
  }: CoreMethodParams<'waitForSignup'>): CoreMethodResponse<'waitForSignup'> {
    const startedAt = Date.now();

    return new Promise((resolve, reject) => {
      (async () => {
        await this.touchSession();

        if (!this.isExternalWalletAuth) {
          // Remove external wallets if creating an account with Para
          this.externalWallets = {};
        }

        while (true) {
          try {
            if (isCanceled() || Date.now() - startedAt > constants.POLLING_TIMEOUT_MS) {
              onCancel?.();
              dispatchEvent(ParaEvent.ACCOUNT_CREATION_EVENT, false, 'failed to sign up user');
              return reject('canceled');
            }

            await new Promise(_resolve => setTimeout(_resolve, constants.POLLING_INTERVAL_MS));

            if (await this.isSessionActive()) {
              dispatchEvent(ParaEvent.ACCOUNT_CREATION_EVENT, true);
              return resolve(true);
            }
            onPoll?.();
          } catch (err) {
            // want to continue polling on error
            console.error(err);
            onPoll?.();
          }
        }
      })();
    });
  }

  async waitForWalletCreation({
    isCanceled = () => false,
    onCancel,
  }: CoreMethodParams<'waitForWalletCreation'> = {}): CoreMethodResponse<'waitForWalletCreation'> {
    await this.waitForSignup({ isCanceled, onCancel });

    const { supportedWalletTypes } = await this.#assertPartner();

    const pregenWallets = await this.getPregenWallets();

    let recoverySecret: string | undefined,
      walletIds: CurrentWalletIds = {};

    if (pregenWallets.length > 0) {
      recoverySecret = await this.claimPregenWallets();
      walletIds = supportedWalletTypes.reduce((acc: CurrentWalletIds, { type }) => {
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
   * Initiates a Farcaster login attempt and returns the URL for the user to connect.
   * You can create a QR code with this URI that works with Farcaster's mobile app.
   * @return {string} the Farcaster connect URI
   */
  async getFarcasterConnectUri({ appScheme }: { appScheme?: string } = {}): CoreMethodResponse<'getFarcasterConnectUri'> {
    const { connect_uri: connectUri } = await this.ctx.client.initializeFarcasterLogin({ appScheme });
    return connectUri;
  }

  protected async verifyFarcasterProcess(
    opts: CoreMethodParams<'verifyFarcaster'> & { isLinkAccount: false },
  ): CoreMethodResponse<'verifyFarcaster'>;
  protected async verifyFarcasterProcess(
    opts: InternalMethodParams<'verifyFarcasterLink'> & { isLinkAccount: true },
  ): InternalMethodResponse<'verifyFarcasterLink'>;

  /**
   * Awaits the response from a user's attempt to log in with Farcaster.
   * If successful, this returns the user's Farcaster username and profile picture and indicates whether the user already exists.
   * @return {Object} `{userExists: boolean; username: string; pfpUrl?: string | null }` - the user's information and whether the user already exists.
   */
  protected async verifyFarcasterProcess({
    isCanceled = () => false,
    onConnectUri,
    onCancel,
    onPoll,
    isLinkAccount,
    ...urlOptions
  }: (CoreMethodParams<'verifyFarcaster'> | InternalMethodParams<'verifyFarcasterLink'>) & {
    isLinkAccount: boolean;
  }): Promise<OAuthResponse | LinkedAccounts> {
    let accountLinkInProgress;
    if (isLinkAccount) {
      accountLinkInProgress = await this.#assertIsLinkingAccountOrStart('FARCASTER');
    }

    if (onConnectUri) {
      const connectUri = await this.getFarcasterConnectUri();

      onConnectUri(connectUri);
    }

    return new Promise((resolve, reject) => {
      (async () => {
        const startedAt = Date.now();
        while (true) {
          try {
            if (isCanceled() || Date.now() - startedAt > constants.POLLING_TIMEOUT_MS) {
              onCancel?.();
              return reject('CANCELED');
            }

            await new Promise(_resolve => setTimeout(_resolve, constants.POLLING_INTERVAL_MS));

            switch (isLinkAccount) {
              case false:
                {
                  const serverAuthState = await this.ctx.client.getFarcasterAuthStatus();

                  if (isServerAuthState(serverAuthState)) {
                    const authState = await this.#prepareAuthState(serverAuthState, urlOptions);

                    return resolve(authState);
                  }
                }
                break;
              case true: {
                const result = await this.verifyLink({
                  accountLinkInProgress,
                });

                if ('isConflict' in result) {
                  throw new Error(AccountLinkError.Conflict);
                }

                return resolve(result);
              }
            }

            onPoll?.();
          } catch (e) {
            if (!isLinkAccount || e.message === AccountLinkError.Conflict) {
              return reject(e.message);
            }
          }
        }
      })();
    });
  }

  async verifyFarcaster(opts: CoreMethodParams<'verifyFarcaster'>): CoreMethodResponse<'verifyFarcaster'> {
    return await this.verifyFarcasterProcess({ ...opts, isLinkAccount: false });
  }

  protected async verifyFarcasterLink(
    opts: InternalMethodParams<'verifyFarcasterLink'>,
  ): InternalMethodResponse<'verifyFarcasterLink'> {
    return await this.verifyFarcasterProcess({ ...opts, isLinkAccount: true });
  }

  /**
   * Generates a URL for the user to log in with OAuth using a desire method.
   *
   * @param {Object} opts the options object
   * @param {TOAuthMethod} opts.method the third-party service to use for OAuth.
   * @param {string} [opts.appScheme] the app scheme to redirect to after the OAuth flow. This is for mobile only.
   * @returns {string} the URL for the user to log in with OAuth.
   */
  #getOAuthUrl({
    method,
    appScheme,
    accountLinkInProgress,
    sessionLookupId,
  }: CoreMethodParams<'getOAuthUrl'> & {
    accountLinkInProgress?: AccountLinkInProgress;
  }): Awaited<CoreMethodResponse<'getOAuthUrl'>> {
    return constructUrl({
      base: getBaseOAuthUrl(this.ctx.env),
      path: `/auth/${method}`,
      params: {
        apiKey: this.ctx.apiKey,
        sessionLookupId,
        appScheme,
        ...(accountLinkInProgress
          ? {
              linkedAccountId: this.accountLinkInProgress.id,
            }
          : {}),
      },
    });
  }

  async getOAuthUrl(opts: CoreMethodParams<'getOAuthUrl'>): CoreMethodResponse<'getOAuthUrl'> {
    const sessionLookupId = opts.sessionLookupId ?? (await this.prepareLogin());

    return this.#getOAuthUrl({ ...opts, sessionLookupId });
  }

  protected verifyOAuthProcess(
    _: InternalMethodParams<'verifyOAuthLink'> & { isLinkAccount: true },
  ): InternalMethodResponse<'verifyOAuthLink'>;
  protected verifyOAuthProcess(
    _: CoreMethodParams<'verifyOAuth'> & { isLinkAccount: false },
  ): CoreMethodResponse<'verifyOAuth'>;

  /**
   * Awaits the response from a user's attempt to log in with OAuth.
   * If successful, this returns the user's email address and indicates whether the user already exists.
   *
   * @param {Object} opts the options object.
   * @param {Window} [opts.popupWindow] the popup window being used for login.
   * @return {Object} `{ email?: string; isError?: boolean; userExists: boolean; }` the result data
   */
  protected async verifyOAuthProcess({
    method,
    appScheme,
    isCanceled = () => false,
    onCancel,
    onPoll,
    onOAuthUrl,
    onOAuthPopup,
    isLinkAccount,
    ...urlOptions
  }: { isLinkAccount: boolean } & (CoreMethodParams<'verifyOAuth'> | InternalMethodParams<'verifyOAuthLink'>)): Promise<
    AuthStateSignupOrLogin | LinkedAccounts
  > {
    let popupWindow;
    if (onOAuthPopup) {
      try {
        popupWindow = await this.platformUtils.openPopup('about:blank', { type: PopupType.OAUTH });
      } catch (error) {
        throw new Error(`Failed to open OAuth popup: ${error}`);
      }
    }

    let sessionLookupId, accountLinkInProgress;

    if (onOAuthUrl || onOAuthPopup) {
      if (isLinkAccount) {
        accountLinkInProgress = await this.#assertIsLinkingAccountOrStart(method);
        sessionLookupId = (await this.touchSession()).sessionLookupId;
      } else {
        sessionLookupId = await this.prepareLogin();
      }

      const oAuthUrl = await this.#getOAuthUrl({ method, appScheme, sessionLookupId, accountLinkInProgress });

      switch (true) {
        case !!onOAuthUrl: {
          onOAuthUrl(oAuthUrl);
          break;
        }
        case !!onOAuthPopup && !!popupWindow: {
          popupWindow.location.href = oAuthUrl;
          onOAuthPopup(popupWindow);
          break;
        }
      }
    } else {
      ({ sessionLookupId } = await this.touchSession());
    }

    const startedAt = Date.now();
    return new Promise((resolve, reject) => {
      (async () => {
        while (true) {
          try {
            if (isCanceled() || Date.now() - startedAt > constants.POLLING_TIMEOUT_MS) {
              onCancel?.();

              return reject(AccountLinkError.Canceled);
            }

            await new Promise(_resolve => setTimeout(_resolve, constants.POLLING_INTERVAL_MS));

            switch (isLinkAccount) {
              case false:
                {
                  const serverAuthState = await this.ctx.client.verifyOAuth();

                  if (isServerAuthState(serverAuthState)) {
                    const authState = await this.#prepareAuthState(serverAuthState, { ...urlOptions, sessionLookupId });

                    return resolve(authState);
                  }
                }
                break;

              case true: {
                const accounts = await this.verifyLink({ accountLinkInProgress });

                return resolve(accounts);
              }
            }

            onPoll?.();
          } catch (err) {
            if (isLinkAccount && err.message === AccountLinkError.Conflict) {
              return reject(err.message);
            }
            onPoll?.();
          }
        }
      })();
    });
  }

  async verifyOAuth(opts: CoreMethodParams<'verifyOAuth'>): CoreMethodResponse<'verifyOAuth'> {
    return await this.verifyOAuthProcess({ ...opts, isLinkAccount: false });
  }

  protected async verifyOAuthLink(opts: InternalMethodParams<'verifyOAuthLink'>): InternalMethodResponse<'verifyOAuthLink'> {
    return await this.verifyOAuthProcess({ ...opts, isLinkAccount: true });
  }

  /**
   * Waits for the session to be active and sets up the user.
   *
   * @param {Object} opts the options object
   * @param {Window} [opts.popupWindow] the popup window being used for login.
   * @param {boolean} [opts.skipSessionRefresh] whether to skip refreshing the session.
   * @returns {Object} `{ isComplete: boolean; isError: boolean; needsWallet: boolean; partnerId: string; }` the result data
   **/
  async waitForLogin({
    isCanceled = () => false,
    onCancel,
    onPoll,
    skipSessionRefresh = false,
  }: CoreMethodParams<'waitForLogin'> = {}): CoreMethodResponse<'waitForLogin'> {
    const startedAt = Date.now();
    return new Promise((resolve, reject) => {
      (async () => {
        if (!this.isExternalWalletAuth) {
          // Remove external wallets if logging in with Capsule
          this.externalWallets = {};
        }

        while (true) {
          if (isCanceled() || Date.now() - startedAt > constants.POLLING_TIMEOUT_MS) {
            dispatchEvent(ParaEvent.LOGIN_EVENT, { isComplete: false }, 'failed to setup user');
            onCancel?.();
            return reject('canceled');
          }

          await new Promise(resolve => setTimeout(resolve, constants.POLLING_INTERVAL_MS));

          try {
            let session = await this.touchSession();
            if (!session.isAuthenticated) {
              onPoll?.();
              continue;
            }

            session = await this.userSetupAfterLogin();

            const needsWallet = session.needsWallet ?? false;

            if (!needsWallet) {
              if (this.currentWalletIdsArray.length === 0) {
                onPoll?.();
                continue;
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
                needsWallet: needsWallet || Object.values(this.wallets).length === 0,
                partnerId: session.partnerId,
              };

              dispatchEvent(ParaEvent.LOGIN_EVENT, resp);
              return resolve(resp);
            }
            onPoll?.();
          } catch (err) {
            // want to continue polling on error
            console.error(err);
            onPoll?.();
          }
        }
      })();
    });
  }

  /**
   * Updates the session with the user management server, possibly
   * opening a popup to refresh the session.
   *
   * @param {Object} opts the options object.
   * @param {boolean} [shouldOpenPopup] - if `true`, the running device will open a popup to reauthenticate the user.
   * @returns a URL for the user to reauthenticate.
   **/
  async refreshSession({
    shouldOpenPopup = false,
  }: CoreMethodParams<'refreshSession'> = {}): CoreMethodResponse<'refreshSession'> {
    const { sessionId } = await this.touchSession(true);
    if (!this.loginEncryptionKeyPair) {
      await this.setLoginEncryptionKeyPair();
    }

    const link = await this.getLoginUrl({
      sessionId,
    });

    if (shouldOpenPopup) {
      await this.platformUtils.openPopup(link);
    }

    return link;
  }

  /**
   * Call this method after login to ensure that the user ID is set
   * internally.
   **/
  protected async userSetupAfterLogin(): Promise<SessionInfo> {
    const session = await this.touchSession();
    await this.setUserId(session.userId);

    if (session.currentWalletIds && session.currentWalletIds !== this.currentWalletIds)
      await this.setCurrentWalletIds(session.currentWalletIds, {
        sessionLookupId: this.isPortal() ? session.sessionLookupId : undefined,
      });

    return session;
  }

  /**
   * Get transmission shares associated with session.
   * @param {Object} opts the options object.
   * @param {boolean} opts.isForNewDevice - true if this device is registering.
   * @returns - transmission keyshares.
   **/
  protected async getTransmissionKeyShares({ isForNewDevice = false }: { isForNewDevice?: boolean } = {}): Promise<any> {
    const session = await this.touchSession();
    const sessionLookupId = isForNewDevice ? `${session.sessionLookupId}-new-device` : session.sessionLookupId;
    return this.ctx.client.getTransmissionKeyshares(this.userId, sessionLookupId);
  }

  /**
   * Call this method after login to perform setup.
   * @param {Object} opts the options object.
   * @param {any[]} opts.temporaryShares optional temporary shares to use for decryption.
   * @param {boolean} [opts.skipSessionRefresh] - whether or not to skip refreshing the session.
   **/
  protected async setupAfterLogin({
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
  }: CoreMethodParams<'distributeNewWalletShare'>): CoreMethodResponse<'distributeNewWalletShare'> {
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
   * @param {TWalletType[]} [opts.types] the types of wallets to create.
   * @returns {Object} the wallets created, their ids, and the recovery secret.
   **/
  async createWalletPerType({
    skipDistribute = false,
    types,
  }: CoreMethodParams<'createWalletPerType'> = {}): CoreMethodResponse<'createWalletPerType'> {
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
  }: CoreMethodParams<'refreshShare'>): CoreMethodResponse<'refreshShare'> {
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
   * @param {TWalletType} opts.type the type of wallet to create.
   * @param {boolean} opts.skipDistribute - if true, recovery share will not be distributed.
   * @returns {[Wallet, string | null]} `[wallet, recoveryShare]` - the wallet object and the new recovery share.
   **/
  async createWallet({
    type: _type,
    skipDistribute = false,
  }: CoreMethodParams<'createWallet'> = {}): CoreMethodResponse<'createWallet'> {
    this.requireApiKey();
    const { supportedWalletTypes } = await this.#assertPartner();
    const walletType = await this.assertIsValidWalletType(
      _type ?? supportedWalletTypes.find(({ optional }) => !optional)?.type,
    );

    let signer: string;
    let wallet: Wallet;
    let keygenRes;

    switch (walletType) {
      case 'SOLANA': {
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
      scheme: walletType === 'SOLANA' ? 'ED25519' : 'DKLS',
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
      [walletType]: [...new Set([...(this.currentWalletIds[walletType] ?? []), walletId])],
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
   * @param {TWalletType} [opts.type] the type of wallet to create. Defaults to the first non-optional type in the instance's `supportedWalletTypes` array.
   * @returns {Wallet} the created wallet.
   **/
  async #createPregenWallet(opts: {
    pregenId: PregenOrGuestAuth;
    type: TWalletType;
  }): CoreMethodResponse<'createPregenWallet'> {
    const { supportedWalletTypes } = await this.#assertPartner();
    const { type: _type = supportedWalletTypes.find(({ optional }) => !optional)?.type, pregenId } = opts;
    this.requireApiKey();
    const walletType = await this.assertIsValidWalletType(
      _type ?? supportedWalletTypes.find(({ optional }) => !optional)?.type,
    );
    const [pregenIdentifierType, pregenIdentifier] = toPregenTypeAndId(pregenId);

    let keygenRes;
    switch (walletType) {
      case 'SOLANA':
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
      scheme: walletType === 'SOLANA' ? 'ED25519' : 'DKLS',
      type: walletType,
      isPregen: true,
      pregenIdentifier,
      pregenIdentifierType,
    };

    await this.waitForPregenWalletAddress(walletId);
    await this.populatePregenWalletAddresses();

    return this.wallets[walletId];
  }

  async createPregenWallet(opts: CoreMethodParams<'createPregenWallet'>): CoreMethodResponse<'createPregenWallet'> {
    return await this.#createPregenWallet(opts);
  }

  /**
   * Creates new pregenerated wallets for each desired type.
   * If no types are provided, this method will create one for each of the non-optional types
   * specified in the instance's `supportedWalletTypes` array that are not already present.
   * @param {Object} opts the options object.
   * @param {string} opts.pregenIdentifier the identifier to associate each wallet with.
   * @param {TPregenIdentifierType} opts.pregenIdentifierType - either `'EMAIL'` or `'PHONE'`.
   * @param {TWalletType[]} [opts.types] the wallet types to create. Defaults to any types the instance supports that are not already present.
   * @returns {Wallet[]} an array containing the created wallets.
   **/
  async createPregenWalletPerType({
    types,
    pregenId,
  }: CoreMethodParams<'createPregenWalletPerType'>): CoreMethodResponse<'createPregenWalletPerType'> {
    const wallets = [];
    for (const type of await this.getTypesToCreate(types)) {
      const wallet = await this.createPregenWallet({ type, pregenId });

      wallets.push(wallet);
    }
    return wallets;
  }

  /**
   * Claims a pregenerated wallet.
   * @param {Object} opts the options object.
   * @param {string} opts.pregenIdentifier string the identifier of the user claiming the wallet
   * @param {TPregenIdentifierType} opts.pregenIdentifierType type of the identifier of the user claiming the wallet
   * @returns {[Wallet, string | null]} `[wallet, recoveryShare]` - the wallet object and the new recovery share.
   **/
  async claimPregenWallets({
    pregenId,
  }: CoreMethodParams<'claimPregenWallets'> = {}): CoreMethodResponse<'claimPregenWallets'> {
    this.requireApiKey();

    const pregenWallets = pregenId ? await this.getPregenWallets({ pregenId }) : await this.getPregenWallets();

    if (pregenWallets.length === 0) {
      return undefined;
    }

    const missingWallets = pregenWallets.filter(wallet => !this.wallets[wallet.id]);
    if (missingWallets.length > 0) {
      throw new Error(
        `Cannot claim pregen wallets because wallet data is missing. Please call setUserShare first to load the wallet data for the following wallet IDs: ${missingWallets.map(w => w.id).join(', ')}`,
      );
    }

    let newRecoverySecret: string | undefined;

    const { walletIds } = await this.ctx.client.claimPregenWallets({
      userId: this.userId,
      walletIds: pregenWallets.map(w => w.id),
    });

    for (const walletId of walletIds) {
      const wallet = this.wallets[walletId];
      let refreshedShare;

      if (wallet.scheme === 'ED25519') {
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
    newPregenId,
  }: CoreMethodParams<'updatePregenWalletIdentifier'>): CoreMethodResponse<'updatePregenWalletIdentifier'> {
    this.requireApiKey();

    const [newPregenIdentifierType, newPregenIdentifier] = toPregenTypeAndId(newPregenId);
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
  async hasPregenWallet({ pregenId }: CoreMethodParams<'hasPregenWallet'>): CoreMethodResponse<'hasPregenWallet'> {
    this.requireApiKey();

    const [pregenIdentifierType, pregenIdentifier] = toPregenTypeAndId(pregenId);
    const wallets = await this.getPregenWallets({ pregenId });
    const wallet = wallets.find(
      w => w.pregenIdentifier === pregenIdentifier && w.pregenIdentifierType === pregenIdentifierType,
    );
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
  async getPregenWallets({ pregenId }: CoreMethodParams<'getPregenWallets'> = {}): CoreMethodResponse<'getPregenWallets'> {
    this.requireApiKey();
    const res = await this.ctx.client.getPregenWallets(
      pregenId ? toPregenIds(pregenId) : this.pregenIds,
      this.isPortal(),
      this.userId,
    );
    return res.wallets.filter(w => this.isWalletSupported(entityToWallet(w)));
  }

  #isCreateGuestWalletsPending = false;

  async createGuestWallets(): CoreMethodResponse<'createGuestWallets'> {
    let error: Error;

    if (this.#isCreateGuestWalletsPending) {
      error = new Error('Guest wallets creation already in progress');
      dispatchEvent(ParaEvent.GUEST_WALLETS_CREATED, null, error.message);
      throw error;
    }

    if (this.isGuestMode) {
      error = new Error('Guest wallets already created');
      dispatchEvent(ParaEvent.GUEST_WALLETS_CREATED, null, error.message);
      throw error;
    }

    try {
      this.#isCreateGuestWalletsPending = true;

      const { supportedWalletTypes } = await this.#assertPartner();
      const wallets = [];
      const guestId = newUuid();

      for (const type of await this.getTypesToCreate(
        supportedWalletTypes.filter(({ optional }) => !optional).map(({ type }) => type),
      )) {
        const wallet = await this.#createPregenWallet({ type, pregenId: { guestId } });

        wallets.push(wallet);
      }

      dispatchEvent(ParaEvent.GUEST_WALLETS_CREATED, wallets);

      this.#isCreateGuestWalletsPending = false;

      return wallets;
    } catch (e) {
      dispatchEvent(ParaEvent.GUEST_WALLETS_CREATED, null, error?.message);

      this.#isCreateGuestWalletsPending = false;

      throw error;
    }
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
  getUserShare(): CoreMethodResponse<'getUserShare'> {
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
  async setUserShare(base64Wallets: CoreMethodParams<'setUserShare'>): CoreMethodResponse<'setUserShare'> {
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
    return this.constructPortalUrl('txReview', {
      pathId: transactionId,
      params: {
        email: this.email,
        timeoutMs: timeoutMs?.toString(),
      },
    });
  }

  private async getOnRampTransactionUrl({
    purchaseId,
  }: { purchaseId: string; providerKey?: string } & WalletParams): Promise<string> {
    return this.constructPortalUrl('onRamp', {
      pathId: purchaseId,
    });
  }

  getWalletBalance = async ({
    walletId,
    rpcUrl,
  }: CoreMethodParams<'getWalletBalance'>): CoreMethodResponse<'getWalletBalance'> => {
    return (await this.ctx.client.getWalletBalance({ walletId, rpcUrl })).balance;
  };

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
    isCanceled = () => false,
    onCancel,
    onPoll,
  }: CoreMethodParams<'signMessage'>): CoreMethodResponse<'signMessage'> {
    this.assertIsValidWalletId(walletId);

    const wallet = this.wallets[walletId];
    let signerId: string = this.userId;
    if (wallet.partnerId && !wallet.userId) {
      signerId = wallet.partnerId;
    }

    let signRes = await this.signMessageInner({ wallet, signerId, messageBase64, cosmosSignDocBase64 });
    let timeStart = Date.now();
    if ((signRes as DeniedSignatureRes).pendingTransactionId) {
      await this.platformUtils.openPopup(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId, timeoutMs),
        { type: cosmosSignDocBase64 ? PopupType.SIGN_TRANSACTION_REVIEW : PopupType.SIGN_MESSAGE_REVIEW },
      );
    } else {
      dispatchEvent(ParaEvent.SIGN_MESSAGE_EVENT, signRes);
      return signRes as SuccessfulSignatureRes;
    }

    while (true) {
      if (isCanceled() || Date.now() - timeStart > timeoutMs) {
        onCancel?.();
        break;
      }

      await new Promise(resolve => setTimeout(resolve, constants.POLLING_INTERVAL_MS));

      try {
        await this.ctx.client.getPendingTransaction(this.userId, signRes.pendingTransactionId);
      } catch (err) {
        const error = new TransactionReviewDenied();
        dispatchEvent(ParaEvent.SIGN_MESSAGE_EVENT, signRes, error.message);
        throw error;
      }

      signRes = await this.signMessageInner({ wallet, signerId, messageBase64, cosmosSignDocBase64 });

      if ((signRes as DeniedSignatureRes).pendingTransactionId) {
        onPoll?.();
        continue;
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
      case 'ED25519':
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
          wallet.scheme === 'DKLS',
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
    isCanceled = () => false,
    onCancel,
    onPoll,
  }: CoreMethodParams<'signTransaction'>): CoreMethodResponse<'signTransaction'> {
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
      wallet.scheme === 'DKLS',
    );

    let timeStart = Date.now();
    if ((signRes as DeniedSignatureRes).pendingTransactionId) {
      await this.platformUtils.openPopup(
        await this.getTransactionReviewUrl((signRes as DeniedSignatureRes).pendingTransactionId, timeoutMs),
        { type: PopupType.SIGN_TRANSACTION_REVIEW },
      );
    } else {
      dispatchEvent(ParaEvent.SIGN_TRANSACTION_EVENT, signRes);
      return signRes as SuccessfulSignatureRes;
    }

    while (true) {
      if (isCanceled() || Date.now() - timeStart > timeoutMs) {
        onCancel?.();
        break;
      }

      await new Promise(resolve => setTimeout(resolve, constants.POLLING_INTERVAL_MS));

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
        wallet.scheme === 'DKLS',
      );

      if ((signRes as DeniedSignatureRes).pendingTransactionId) {
        onPoll?.();
        continue;
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
    options: CoreMethodParams<'initiateOnRampTransaction'>,
  ): CoreMethodResponse<'initiateOnRampTransaction'> {
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
      const onRampWindow = await this.platformUtils.openPopup(portalUrl, { type: PopupType.ON_RAMP_TRANSACTION });

      this.onRampPopup = { window: onRampWindow, onRampPurchase };
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
   * @param {boolean} excludeSigners - whether or not to exclude the signer from the exported wallets.
   * @returns {string} the serialized session
   */
  exportSession({ excludeSigners = false }: CoreMethodParams<'exportSession'> = {}): CoreMethodResponse<'exportSession'> {
    const sessionInfo = {
      authInfo: this.#authInfo,
      userId: this.userId,
      wallets: structuredClone(this.wallets),
      currentWalletIds: this.currentWalletIds,
      sessionCookie: this.retrieveSessionCookie(),
      externalWallets: this.externalWallets,
    };

    if (excludeSigners) {
      for (const wallet of Object.values(sessionInfo.wallets)) {
        delete wallet.signer;
      }
    }

    return Buffer.from(JSON.stringify(sessionInfo)).toString('base64');
  }

  /**
   * Imports a session serialized by another Para instance.
   * @param {string} serializedInstanceBase64 the serialized session
   */
  async importSession(serializedInstanceBase64: CoreMethodParams<'importSession'>): CoreMethodResponse<'importSession'> {
    const serializedInstance = Buffer.from(serializedInstanceBase64, 'base64').toString('utf8');
    const sessionInfo = jsonParse(serializedInstance);

    const authInfo = sessionInfo.authInfo ?? this.#toAuthInfo(sessionInfo);
    await this.#setAuthInfo(authInfo);

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
  }

  /**
   * Retrieves a token to verify the current session.
   * @returns {Promise<string>} the ID
   **/
  async getVerificationToken(): CoreMethodResponse<'getVerificationToken'> {
    const { sessionLookupId } = await this.touchSession();

    return sessionLookupId;
  }

  async issueJwt({ keyIndex = 0 }: CoreMethodParams<'issueJwt'> = {}): CoreMethodResponse<'issueJwt'> {
    const res = await this.ctx.client.issueJwt({ keyIndex });

    return res;
  }

  /**
   * Logs the user out.
   * @param {Object} opts the options object.
   * @param {boolean} opts.clearPregenWallets if `true`, will remove all pregen wallets from storage
   **/
  async logout({ clearPregenWallets = false }: { clearPregenWallets?: boolean } = {}): Promise<void> {
    const shouldDispatchLogoutEvent = await this.isSessionActive();

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
    this.#authInfo = undefined;
    this.accountLinkInProgress = undefined;
    this.userId = undefined;
    this.sessionCookie = undefined;

    if (shouldDispatchLogoutEvent) {
      dispatchEvent(ParaEvent.LOGOUT_EVENT, null);
    }
  }

  protected get toStringAdditions(): Record<string, unknown> {
    return {};
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
    const redactedExternalWallets = Object.keys(this.externalWallets).reduce(
      (acc, walletId) => ({
        ...acc,
        [walletId]: {
          ...this.externalWallets[walletId],
          signer: this.externalWallets[walletId].signer ? '[REDACTED]' : undefined,
        },
      }),
      {},
    );
    const obj = {
      partnerId: this.partner?.id,
      supportedWalletTypes: this.partner?.supportedWalletTypes,
      cosmosPrefix: this.partner?.cosmosPrefix,
      authInfo: this.#authInfo,
      isGuestMode: this.isGuestMode,
      userId: this.userId,
      pregenIds: this.pregenIds,
      currentWalletIds: this.currentWalletIds,
      guestWalletIds: this.#guestWalletIds,
      wallets: redactedWallets,
      externalWallets: redactedExternalWallets,
      loginEncryptionKeyPair: this.loginEncryptionKeyPair ? '[REDACTED]' : undefined,
      isReady: this.isReady,
      ...this.toStringAdditions,
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

  protected devLog(...s: string[]) {
    if (this.ctx.env === Environment.DEV || this.ctx.env === Environment.SANDBOX) {
      // eslint-disable-next-line no-console
      console.log(...s);
    }
  }

  protected async getNewCredentialAndUrl({
    authMethod = 'PASSKEY',
    isForNewDevice = false,
    portalTheme,
    shorten = false,
  }: NewCredentialUrlParams = {}): Promise<{ credentialId: string; url?: string }> {
    this.assertIsAuthSet();

    let credentialId: string, urlType: Extract<PortalUrlType, 'createAuth' | 'createPassword'>;
    switch (authMethod) {
      case 'PASSKEY':
        ({
          data: { id: credentialId },
        } = await this.ctx.client.addSessionPublicKey(this.userId, {
          status: PublicKeyStatus.PENDING,
          type: PublicKeyType.WEB,
        }));
        urlType = 'createAuth';
        break;
      case 'PASSWORD':
        ({
          data: { id: credentialId },
        } = await this.ctx.client.addSessionPasswordPublicKey(this.userId, {
          status: PasswordStatus.PENDING,
        }));
        urlType = 'createPassword';
        break;
    }

    const url =
      this.isNativePasskey && urlType === 'createAuth'
        ? undefined
        : await this.constructPortalUrl(urlType, {
            isForNewDevice,
            pathId: credentialId,
            portalTheme,
            shorten,
          });

    return { credentialId, ...(url ? { url } : {}) };
  }

  /**
   * Returns a Para Portal URL for logging in with a WebAuth passkey or a password.
   * @param {Object} opts the options object
   * @param {String} opts.auth - the user auth to sign up or log in with, in the form ` { email: string } | { phone: `+${number}` } `
   * @param {boolean} opts.useShortUrls - whether to shorten the generated portal URLs
   * @param {Theme} opts.portalTheme the Para Portal theme to apply to the password creation URL, if other than the default theme
   * @returns {SignUpOrLogInResponse} an object in the form of either: `{ stage: 'verify' }` or `{ stage: 'login'; passkeyUrl?: string; passwordUrl?: string; biometricHints?: BiometricLocationHint[] }`
   */
  protected async getLoginUrl({
    authMethod = 'PASSKEY',
    shorten = false,
    portalTheme,
    sessionId,
  }: LoginUrlParams): Promise<string> {
    if (!sessionId) {
      sessionId = (await this.touchSession()).sessionLookupId;
    }

    this.assertIsAuthSet();

    let urlType: 'loginAuth' | 'loginPassword';
    switch (authMethod) {
      case 'PASSKEY':
        urlType = 'loginAuth';
        break;
      case 'PASSWORD':
        urlType = 'loginPassword';
        break;
      default:
        throw new Error(`invalid authentication method: '${authMethod}'`);
    }
    return this.constructPortalUrl(urlType, {
      sessionId,
      shorten,
      portalTheme,
    });
  }

  async #prepareAuthState<T extends ServerAuthStateVerify | ServerAuthStateLogin | ServerAuthStateSignup>(
    serverAuthState: T,
    opts: WithCustomTheme & WithUseShortUrls & { sessionLookupId?: string } = {},
  ): Promise<
    | (T extends ServerAuthStateVerify ? AuthStateVerify : never)
    | (T extends ServerAuthStateLogin ? AuthStateLogin : never)
    | (T extends ServerAuthStateSignup ? AuthStateSignup : never)
  > {
    if (!opts.sessionLookupId && serverAuthState.stage === 'login') {
      opts.sessionLookupId = await this.prepareLogin();
    }

    const { auth, externalWallet, userId, displayName, pfpUrl, username } = serverAuthState;

    const authInfo = {
      ...extractAuthInfo(auth, { isRequired: true }),
      ...Object.fromEntries(
        Object.entries({
          displayName,
          pfpUrl,
          username,
          externalWallet,
        }).filter(([_, v]) => !!v),
      ),
    };
    await this.#setAuthInfo(authInfo);

    await this.assertIsAuthSet();

    if (!!externalWallet) {
      await this.setExternalWallet([externalWallet]);
    }

    if (!!userId) {
      await this.setUserId(userId);
    }

    let authState;

    switch (serverAuthState.stage) {
      case 'verify':
        authState = serverAuthState;
        break;
      case 'login':
        if (externalWallet && !externalWallet?.withFullParaAuth) {
          authState = serverAuthState;
          break;
        }

        authState = await this.#prepareLoginState(serverAuthState, { ...opts, sessionLookupId: opts.sessionLookupId! });
        break;
      case 'signup':
        if (externalWallet && !externalWallet?.withFullParaAuth) {
          authState = serverAuthState;
          break;
        }

        authState = await this.#prepareSignUpState(serverAuthState, opts);
        break;
    }

    return authState;
  }

  protected async prepareLogin(): InternalMethodResponse<'prepareLogin'> {
    await this.logout();
    const { sessionLookupId } = await this.touchSession(true);

    if (!this.loginEncryptionKeyPair) {
      await this.setLoginEncryptionKeyPair();
    }

    return sessionLookupId;
  }

  async #prepareLoginState(
    loginState: ServerAuthStateLogin,
    {
      useShortUrls: shorten = false,
      portalTheme,
      sessionLookupId,
    }: {
      useShortUrls?: boolean;
      portalTheme?: Theme;
      sessionLookupId: string;
    },
  ): Promise<AuthStateLogin> {
    const { loginAuthMethods, ...authState } = loginState;

    const isPasskeySupported = await this.isPasskeySupported(),
      isPasskeyPossible = loginAuthMethods.includes(AuthMethod.PASSKEY) && !this.isNativePasskey,
      isPasswordPossible = loginAuthMethods.includes(AuthMethod.PASSWORD);

    return {
      ...authState,
      isPasskeySupported,
      ...(isPasskeyPossible
        ? {
            passkeyUrl: await this.getLoginUrl({ sessionId: sessionLookupId, shorten, portalTheme }),
            passkeyKnownDeviceUrl: await this.constructPortalUrl('loginAuth', {
              sessionId: sessionLookupId,
              newDevice: {
                sessionId: sessionLookupId,
                encryptionKey: getPublicKeyHex(this.loginEncryptionKeyPair),
              },
              shorten,
              portalTheme,
            }),
          }
        : {}),
      ...(isPasswordPossible
        ? {
            passwordUrl: await this.constructPortalUrl('loginPassword', {
              sessionId: sessionLookupId,
              shorten,
              portalTheme,
              params: { isEmbedded: `${!loginState.isWalletSelectionNeeded}` },
            }),
          }
        : {}),
    };
  }

  async #prepareSignUpState(
    serverSignupState: ServerAuthStateSignup,
    { useShortUrls: shorten = false, portalTheme }: WithCustomTheme & WithUseShortUrls,
  ): Promise<AuthStateSignup> {
    const { signupAuthMethods, ...authState } = serverSignupState;

    const isPasskeySupported = await this.isPasskeySupported();

    const [isPasskey, isPassword] = [
      signupAuthMethods.includes(AuthMethod.PASSKEY),
      signupAuthMethods.includes(AuthMethod.PASSWORD) || !isPasskeySupported,
    ];

    if (!isPasskey && !isPassword) {
      throw new Error(
        'No supported authentication methods found. Please ensure you have enabled either WebAuth passkeys or passwords in your Developer Portal settings.',
      );
    }

    const signupState: Partial<AuthStateSignup> = { ...authState, isPasskeySupported };

    if (isPasskey) {
      const { url: passkeyUrl, credentialId: passkeyId } = await this.getNewCredentialAndUrl({
        authMethod: 'PASSKEY',
        shorten,
      });

      if (passkeyUrl) signupState.passkeyUrl = passkeyUrl;
      signupState.passkeyId = passkeyId;
    }

    if (isPassword) {
      const { url: passwordUrl, credentialId: passwordId } = await this.getNewCredentialAndUrl({
        authMethod: 'PASSWORD',
        portalTheme,
        shorten,
      });

      signupState.passwordUrl = passwordUrl;
      signupState.passwordId = passwordId;
    }

    return <AuthStateSignup>signupState;
  }

  async signUpOrLogIn({ auth, ...urlOptions }: CoreMethodParams<'signUpOrLogIn'>): CoreMethodResponse<'signUpOrLogIn'> {
    const serverAuthState = await this.ctx.client.signUpOrLogIn({
      ...auth,
      ...this.getVerificationEmailProps(),
    });

    const authInfo = serverAuthState.auth;
    if (this.fetchPregenWalletsOverride && isPregenAuth(authInfo)) {
      const { userShare } = await this.fetchPregenWalletsOverride({ pregenId: authInfo });
      if (userShare) {
        await this.setUserShare(userShare);
      }
    }

    return this.#prepareAuthState(serverAuthState, urlOptions);
  }

  async verifyNewAccount({
    verificationCode,
    ...urlOptions
  }: CoreMethodParams<'verifyNewAccount'>): CoreMethodResponse<'verifyNewAccount'> {
    this.assertIsAuthSet(['email', 'phone']);
    const userId = this.assertUserId({ allowGuestMode: true });

    const serverAuthState = await this.ctx.client.verifyNewAccount(userId, {
      verificationCode,
    });

    return this.#prepareAuthState(serverAuthState, urlOptions);
  }

  async getLinkedAccounts({
    withMetadata = false,
  }: CoreMethodParams<'getLinkedAccounts'> = {}): CoreMethodResponse<'getLinkedAccounts'> {
    const userId = this.assertUserId();

    const { accounts } = await this.ctx.client.getLinkedAccounts({ userId, withMetadata });

    return {
      userId,
      ...accounts,
    };
  }

  protected async linkAccount(opts: InternalMethodParams<'linkAccount'>): InternalMethodResponse<'linkAccount'> {
    const { supportedAccountLinks = [...LINKED_ACCOUNT_TYPES] } = await this.#assertPartner();

    let type, identifier, externalWallet, isPermitted;
    switch (true) {
      case 'auth' in opts:
        {
          const authInfo = extractAuthInfo((opts as { auth: VerifiedAuth }).auth, { isRequired: true });

          if (authInfo.auth === this.authInfo!.auth) {
            throw new Error(AccountLinkError.Conflict);
          }

          type = authInfo.authType.toUpperCase() as 'EMAIL' | 'PHONE';
          identifier = authInfo.identifier;
          isPermitted = supportedAccountLinks.includes(type);
        }
        break;

      case 'externalWallet' in opts:
        {
          externalWallet = (opts as { externalWallet: ExternalWalletInfo }).externalWallet;
          type = 'EXTERNAL_WALLET';
          isPermitted =
            supportedAccountLinks.includes('EXTERNAL_WALLET') || supportedAccountLinks.includes(externalWallet.providerId);
        }
        break;
      case 'type' in opts:
        {
          type = (opts as { type: TLinkedAccountType | 'X' }).type;
          if (type === 'X') {
            type = 'TWITTER';
          }
          isPermitted = supportedAccountLinks.includes(type);
        }
        break;

      default:
        throw new Error('Invalid parameters for linking account, must pass `auth` or `type` or `externalWallet');
    }

    if (!isPermitted) {
      throw new Error(`Account linking for type '${type}' is not supported by the current API key configuration`);
    }

    const userId = this.assertUserId();

    const result = await this.ctx.client.linkAccount({
      userId,
      type,
      ...(identifier ? { identifier } : {}),
      ...(externalWallet ? { externalWallet } : {}),
    });

    if ('isConflict' in result) {
      throw new Error(AccountLinkError.Conflict);
    }

    const { linkedAccountId, signatureVerificationMessage } = result;

    this.accountLinkInProgress = {
      id: linkedAccountId,
      type,
      isComplete: false,
      ...(identifier ? { identifier } : {}),
      ...(signatureVerificationMessage && externalWallet
        ? {
            externalWallet: {
              ...externalWallet,
              signatureVerificationMessage,
            },
          }
        : {}),
    };

    return this.accountLinkInProgress;
  }

  protected async unlinkAccount({
    linkedAccountId,
  }: InternalMethodParams<'unlinkAccount'>): InternalMethodResponse<'unlinkAccount'> {
    if (!linkedAccountId) {
      throw new Error('No linked account ID provided');
    }

    const userId = this.assertUserId();

    const accounts = await this.ctx.client.unlinkAccount({ linkedAccountId, userId });

    return accounts;
  }

  protected async verifyLink({
    accountLinkInProgress = this.#assertIsLinkingAccount(),
    ...opts
  }: { accountLinkInProgress?: AccountLinkInProgress } & Partial<
    Pick<VerifyLinkParams, 'verificationCode' | 'telegramAuthResponse'> & VerifyExternalWalletParams
  > = {}): Promise<LinkedAccounts> {
    try {
      const userId = this.assertUserId(),
        result = await this.ctx.client.verifyLink({
          linkedAccountId: accountLinkInProgress.id,
          userId,
          ...opts,
        });

      if ('isConflict' in result) {
        throw new Error(AccountLinkError.Conflict);
      }

      this.accountLinkInProgress = undefined;

      return result.accounts;
    } catch (e) {
      throw new Error(e.message === AccountLinkError.Conflict ? AccountLinkError.Conflict : e.message);
    }
  }

  protected async verifyEmailOrPhoneLink({
    verificationCode,
  }: InternalMethodParams<'verifyEmailOrPhoneLink'>): InternalMethodResponse<'verifyEmailOrPhoneLink'> {
    const accounts = await this.verifyLink({
      accountLinkInProgress: this.#assertIsLinkingAccount(['EMAIL', 'PHONE']),
      verificationCode,
    });

    return accounts;
  }
}
