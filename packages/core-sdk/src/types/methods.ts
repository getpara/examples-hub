import {
  PrimaryAuthInfo,
  ServerAuthStateLogin,
  ServerAuthStateSignup,
  AuthMethod,
  ServerAuthStateVerify,
  VerifiedAuth,
  AuthExtras,
  RecoveryStatus,
  Theme,
  TOAuthMethod,
  TWalletType,
  TelegramAuthResponse,
  VerifyThirdPartyAuth,
  ServerAuthStateDone,
} from '@getpara/user-management-client';
import { Wallet } from './wallet.js';

type Device = {
  sessionId: string;
  encryptionKey: string;
};

export type EmbeddedWalletType = Exclude<TWalletType, never>;

export type ExternalWalletType = Exclude<TWalletType, never>;

export type VerifyExternalWalletV1 = {
  address: string;
  signedMessage: string;
  cosmosPublicKeyHex?: string;
  cosmosSigner?: string;
};

export type PortalUrlType =
  | 'createAuth'
  | 'createPassword'
  | 'loginAuth'
  | 'loginPassword'
  | 'txReview'
  | 'onRamp'
  | 'telegramLogin'
  | 'createPIN'
  | 'loginPIN'
  | 'oAuth'
  | 'oAuthCallback'
  | 'loginOTP'
  | 'telegramLoginVerify'
  | 'loginFarcaster';

export type PortalUrlOptions = {
  params?: Record<string, string | undefined | null>;
  isForNewDevice?: boolean;
  thisDevice?: Device;
  newDevice?: Device;
  sessionId?: string;
  portalTheme?: Theme;
  pathId?: string;
  shorten?: boolean;
  isEmbedded?: boolean;
  oAuthMethod?: OAuthUrlParams['method'];
  appScheme?: string;
  encryptionKey?: string;
};

export type WithAuthMethod = {
  /**
   * Which authorization method to use for the URL, either `'passkey'` or `'password'`.
   */
  authMethod?: Uppercase<AuthMethod>;
};

export type WithCustomTheme = {
  /**
   * The theme to apply to generated URLs, if different from your configured theme.
   */
  portalTheme?: Theme;
};

export type WithUseShortUrls = {
  /**
   * Whether to shorten generated URLs. This may correct any issues with generated QR codes. Defaults to `false`.
   */
  useShortUrls?: boolean;
};

export type WithShorten = {
  /**
   * Whether to shorten the generated URL. This may correct any issues with generated QR codes. Defaults to `false`.
   */
  shorten?: boolean;
};

export type WithIsPasskeySupported = {
  /**
   * Whether the current device supports WebAuth passkeys.
   */
  isPasskeySupported: boolean;
};

export type PollParams = {
  /**
   * A callback function that will be invoked on each method poll.
   */
  onPoll?: () => void;
  /**
   * A callback function that will be invoked if the method call is canceled.
   */
  onCancel?: () => void;
};

export type FarcasterParams = PollParams & {
  /**
   * A function returning a boolean, indicating whether the Farcaster login process should be cancelled.
   */
  isCanceled?: () => boolean;
  /**
   * A callback function that will be invoked with the Farcaster Connect URI when it is available.
   * You will need to display the URI as a QR code.
   */
  onConnectUri?: (uri: string) => void;
  serverAuthState?: VerifyThirdPartyAuth;
};

export type TelegramParams = {
  /**
   * The response received from the Telegram login bot.
   */
  telegramAuthResponse?: TelegramAuthResponse;
  serverAuthState?: VerifyThirdPartyAuth;
};

export type LoginUrlParams = WithAuthMethod & WithCustomTheme & WithShorten & { sessionId?: string };

export type NewCredentialUrlParams = WithAuthMethod &
  WithCustomTheme &
  WithShorten & {
    /**
     * Whether the URL is meant to add a passkey for a previous user on a new device. Defaults to `false`.
     */
    isForNewDevice?: boolean;
  };

export type OAuthUrlParams = {
  /**
   * The third-party OAuth service.
   */
  method: Exclude<TOAuthMethod, 'TELEGRAM' | 'FARCASTER'>;
  /**
   * The app scheme to redirect to after OAuth is complete.
   */
  appScheme?: string;
};

export type OAuthParams = OAuthUrlParams &
  PollParams & {
    /**
     * A function returning a boolean, indicating whether the OAuth process should be cancelled.
     */
    isCanceled?: () => boolean;

    /**
     * A callback function that will be invoked with the OAuth URL when it is available.
     * For example, you can use this to open the URL in a new window or tab.
     *
     * You should pass one of `onOAuthUrl` or `onOAuthPopup`, not both.
     */
    onOAuthUrl?: (url: string) => void;
    /**
     * A callback function that will be invoked with the OAuth popup window when it is available.
     * If supplied, a window will automatically be opened for you if running on an applicable platform.
     *
     * You should pass one of `onOAuthUrl` or `onOAuthPopup`, not both.
     */
    onOAuthPopup?: (popup: Window) => void;
  };

export type AuthStateBaseParams = WithCustomTheme & WithUseShortUrls;

export type AuthStateVerify = ServerAuthStateVerify & {
  loginUrl?: string;
};

export type AuthStateLogin = Omit<ServerAuthStateLogin, 'loginAuthMethods'> &
  WithIsPasskeySupported & {
    /**
     * A Para Portal URL for logging in via a WebAuth passkey. For best compatibility, you should open this URL in a new window or tab.
     */
    passkeyUrl?: string;
    /**
     * A Para Portal URL for authorizing a new device using a WebAuth passkey located elsewhere, to be visited using that other device.
     */
    passkeyKnownDeviceUrl?: string;
    /**
     * A Para Portal URL for logging in via a password.
     */
    passwordUrl?: string;
    /**
     * A Para Portal URL for logging in via a PIN.
     */
    pinUrl?: string;
  };

export type AuthStateSignup = Omit<ServerAuthStateSignup, 'signupAuthMethods'> &
  WithIsPasskeySupported & {
    /**
     * A Para Portal URL for creating a new WebAuth passkey.
     */
    passkeyUrl?: string;
    /**
     * A Para Portal URL for creating a new user password.
     */
    passwordUrl?: string;
    /**
     * A Para Portal URL for creating a new user PIN.
     */
    pinUrl?: string;
    /**
     * The Para system ID for the newly generated passkey.
     */
    passkeyId?: string;
    /**
     * The Para system ID for the newly generated password.
     */
    passwordId?: string;
    /**
     * The Para system ID for the newly generated PIN.
     */
    pinId?: string;
  };

export type AuthStateDone = ServerAuthStateDone;

export type AuthStateVerifyOrLogin = AuthStateVerify | AuthStateLogin;

export type AuthStateSignupOrLoginOrDone = AuthStateSignup | AuthStateLogin | AuthStateDone;

export type OAuthResponse = AuthStateSignupOrLoginOrDone;

export type AuthState = AuthStateVerify | AuthStateLogin | AuthStateSignup | AuthStateDone;

export type Verify2faParams = {
  auth: VerifiedAuth;
  verificationCode: string;
};

export type Verify2faResponse = {
  /**
   * When the 2FA verification code was sent.
   */
  initiatedAt?: Date;
  /**
   * The status for the 2FA process.
   */
  status?: RecoveryStatus;
  /**
   * The matched user ID.
   */
  userId: string;
  /**
   * The wallets protected by this 2FA instance.
   */
  wallets: Pick<Wallet, 'address' | 'id'>[];
};

export type CoreAuthInfo = PrimaryAuthInfo & AuthExtras;

export type StorageType = 'local' | 'session' | 'secure' | 'all';

export type GetWalletBalanceParams = {
  walletId: string;
  rpcUrl?: string;
};

export type GetWalletBalanceResponse = Promise<string | undefined>;
