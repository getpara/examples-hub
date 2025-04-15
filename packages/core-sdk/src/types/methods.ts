import {
  AuthType,
  PrimaryAuthInfo,
  ServerAuthStateLogin,
  ServerAuthStateSignup,
  AuthMethod,
  ServerAuthStateVerify,
  VerifiedAuth,
  AuthExtras,
  OAuthMethod,
  WalletType,
} from '@getpara/user-management-client';
import { Theme } from './theme.js';
import { RecoveryStatus } from './recovery.js';
import { Wallet } from './wallet.js';

type Device = {
  sessionId: string;
  encryptionKey: string;
};

export type EmbeddedWalletType = Exclude<WalletType, never>;

export type ExternalWalletType = Exclude<WalletType, never>;

export type VerifyExternalWalletV1 = {
  address: string;
  signedMessage: string;
  cosmosPublicKeyHex?: string;
  cosmosSigner?: string;
};

export type PortalUrlType = 'createAuth' | 'createPassword' | 'loginAuth' | 'loginPassword' | 'txReview' | 'onRamp';

export type PortalUrlOptions = {
  params?: Record<string, string | undefined | null>;
  authType?: AuthType;
  isForNewDevice?: boolean;
  loginEncryptionPublicKey?: string;
  newDeviceSessionId?: string;
  newDeviceEncryptionKey?: string;
  partnerId?: string;
  sessionId?: string;
  theme?: Theme;
  pathId?: string;
  displayName?: string;
  pfpUrl?: string;
};

export type PortalUrlOptionsV2 = {
  params?: Record<string, string | undefined | null>;
  isForNewDevice?: boolean;
  thisDevice?: Device;
  newDevice?: Device;
  sessionId?: string;
  portalTheme?: Theme;
  pathId?: string;
  shorten?: boolean;
};

export type GetWebAuthUrlForLoginParams = {
  /**
   * The session ID for the URL.
   */
  sessionId: string;
  /**
   * Either 'email' | 'phone' | 'farcaster' | 'telegram'
   */
  authType?: AuthType;
  /**
   * The public key to use for encrypting the login encryption key.
   */
  loginEncryptionPublicKey: string;
  /**
   * The partner ID for the URL.
   */
  partnerId?: string;
  /**
   * The session ID for the new device being registered.
   */
  newDeviceSessionId?: string;
  /**
   * The public key for the new device being registered.
   */
  newDeviceEncryptionKey?: string;
  /**
   * The Telegram or Farcaster display name for the user.
   */
  displayName?: string;
  /**
   * The Telegram or Farcaster URL for the user's profile picture.
   */
  pfpUrl?: string;
};
export type WithAuthMethod = {
  /**
   * Which authorization method to use for the URL, either `'passkey'` or `'passwprd'`.
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
  method: Exclude<OAuthMethod, 'TELEGRAM' | 'FARCASTER'>;
  /**
   * The deeplink URL to redirect to after OAuth is complete.
   */
  deeplinkUrl?: string;
};

export type AuthStateBaseParams = WithCustomTheme & WithUseShortUrls;

export type AuthStateVerify = ServerAuthStateVerify;

export type AuthStateLogin = Omit<ServerAuthStateLogin, 'loginAuthMethods'> & {
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
};

export type AuthStateSignup = Omit<ServerAuthStateSignup, 'signupAuthMethods'> & {
  /**
   * A Para Portal URL for creating a new WebAuth passkey.
   */
  passkeyUrl?: string;
  /**
   * A Para Portal URL for creating a new user password.
   */
  passwordUrl?: string;
  /**
   * The Para system ID for the newly generated passkey.
   */
  passkeyId?: string;
  /**
   * The Para system ID for the newly generated password.
   */
  passwordId?: string;
};

export type AuthStateVerifyOrLogin = AuthStateVerify | AuthStateLogin;

export type AuthStateSignupOrLogin = AuthStateSignup | AuthStateLogin;

export type OAuthResponse = AuthStateSignupOrLogin;

export type AuthState = AuthStateVerify | AuthStateLogin | AuthStateSignup;

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
