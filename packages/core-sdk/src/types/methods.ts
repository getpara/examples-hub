import { AuthType, PrimaryAuthInfo, WalletType } from '@getpara/user-management-client';
import { Theme } from './theme.js';

export type EmbeddedWalletType = Exclude<WalletType, never>;

export type ExternalWalletType = Exclude<WalletType, never>;

export type ExternalWalletInfo = {
  address: string;
  type: ExternalWalletType;
  provider?: string;
  addressBech32?: string;
  withFullParaAuth?: boolean;
};

export type VerifyExternalWallet = {
  address: string;
  signedMessage: string;
  cosmosPublicKeyHex?: string;
  cosmosSigner?: string;
};

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

export type AuthExtras = {
  /**
   * The current user's third-party username.
   */
  username?: string;
  /**
   * The current user's third-party display name.
   */
  displayName?: string;
  /**
   * The current user's third-party profile picture URL.
   */
  pfpUrl?: string;
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
export type CoreAuthInfo = PrimaryAuthInfo & AuthExtras;
