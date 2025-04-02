import { CurrentWalletIds, ExternalWalletType, SupportedWalletTypes } from './wallet.js';

export const AUTH_TYPES = [
  'email',
  'phone',
  'phoneLegacy',
  'farcaster',
  'telegram',
  'userId',
  'externalWallet',
  'discord',
  'x',
  'customId',
] as const;

export type AuthType =
  | 'email'
  | 'phone'
  | 'phoneLegacy'
  | 'farcaster'
  | 'telegram'
  | 'userId'
  | 'externalWallet'
  | 'discord'
  | 'x'
  | 'customId';

export type PrimaryAuthType = Extract<AuthType, 'email' | 'phone' | 'farcaster' | 'telegram' | 'externalWallet'>;

export type VerifiedAuthType = Extract<PrimaryAuthType, 'email' | 'phone' | 'externalWallet'>;

export type PregenAuthType = Exclude<PrimaryAuthType, 'externalWallet'> | Extract<AuthType, 'discord' | 'x' | 'customId'>;

export type AuthIdentifier<T extends AuthType | never> = T extends 'phone' ? `+${number}` : string;

export type AuthInfo<T extends Exclude<AuthType, 'phoneLegacy'> = Exclude<AuthType, 'phoneLegacy'>> = {
  auth: Auth<T>;
  authType: T;
  identifier: AuthIdentifier<T>;
};

export type PrimaryAuthInfo = AuthInfo<PrimaryAuthType>;

export type VerifiedAuthInfo = AuthInfo<VerifiedAuthType>;

export type PregenAuthInfo = AuthInfo<PregenAuthType>;

export type AuthParams = Record<string, any> & {
  email?: string;
  phone?: string;
  countryCode?: string;
  farcasterUsername?: string;
  telegramUserId?: string;
  userId?: string;
  externalWalletAddress?: string;
};

export type Auth<T extends AuthType = AuthType> = T extends 'email'
  ? { email: string }
  : T extends 'phoneLegacy'
    ? { phone: string; countryCode: string }
    : T extends 'phone'
      ? { phone: AuthIdentifier<'phone'> }
      : T extends 'farcaster'
        ? { farcasterUsername: AuthIdentifier<'farcaster'> }
        : T extends 'telegram'
          ? { telegramUserId: AuthIdentifier<'telegram'> }
          : T extends 'externalWallet'
            ? { externalWalletAddress: AuthIdentifier<'externalWallet'> }
            : T extends 'x'
              ? { xUsername: AuthIdentifier<'x'> }
              : T extends 'discord'
                ? { discordUsername: AuthIdentifier<'discord'> }
                : T extends 'customId'
                  ? { customId: AuthIdentifier<'customId'> }
                  : { userId: AuthIdentifier<'userId'> };

export type PrimaryAuth = Auth<PrimaryAuthType>;

export type VerifiedAuth = Auth<VerifiedAuthType>;

export type PregenAuth = Auth<PregenAuthType>;

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
  /**
   * The current user's external wallet information.
   */
  externalWallet?: ExternalWalletInfo;
};

export enum EncryptorType {
  USER = 'USER',
  RECOVERY = 'RECOVERY',
  BIOMETRICS = 'BIOMETRICS',
  PASSWORD = 'PASSWORD',
}

export enum KeyShareType {
  USER = 'USER',
  RECOVERY = 'RECOVERY',
}

export enum PasswordStatus {
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
}

export enum PublicKeyStatus {
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
}

export enum PublicKeyType {
  MOBILE = 'MOBILE',
  WEB = 'WEB',
}

export interface EncryptedKeyShare {
  encryptedShare: string;
  encryptedKey?: string;
  type: KeyShareType;
  biometricPublicKey?: string;
  encryptor: EncryptorType;
  recoveryPublicKeyId?: string;
  partnerId?: string;
  protocolId?: string;
}

export enum OAuthMethod {
  GOOGLE = 'GOOGLE',
  TWITTER = 'TWITTER',
  APPLE = 'APPLE',
  DISCORD = 'DISCORD',
  FACEBOOK = 'FACEBOOK',
  FARCASTER = 'FARCASTER',
  TELEGRAM = 'TELEGRAM',
}

export enum AuthMethod {
  PASSWORD = 'PASSWORD',
  PASSKEY = 'PASSKEY',
}

export type BiometricLocationHint = { useragent?: string; aaguid?: string };

export type TelegramAuthResponse = {
  auth_date: number;
  first_name?: string;
  hash: string;
  id: number;
  last_name?: string;
  photo_url?: string;
  username?: string;
};

export type SessionInfo = {
  userId?: string;
  sessionId?: string;
  sessionLookupId?: string;
  partnerId: string;
  biometricVerifiedAt?: number;
  currentWalletIds?: CurrentWalletIds;
  needsWallet?: boolean;
  isAuthenticated?: boolean;
  supportedWalletTypes: SupportedWalletTypes;
  cosmosPrefix?: string;
  origin?: string;
  email?: string;
};

export type ServerAuthStateBase = AuthExtras & {
  auth: PrimaryAuth;
  userId: string;
};

export type ServerAuthStateVerify = ServerAuthStateBase & {
  stage: 'verify';
  signatureVerificationMessage?: string;
};

export type ServerAuthStateSignup = ServerAuthStateBase & {
  stage: 'signup';
  signupAuthMethods: AuthMethod[];
};

export type ServerAuthStateLogin = ServerAuthStateBase & {
  stage: 'login';
  biometricHints?: BiometricLocationHint[];
  loginAuthMethods: AuthMethod[];
};

export type VerifyThirdPartyAuth = ServerAuthStateSignup | ServerAuthStateLogin;

export type ExternalWalletInfo = {
  address: string;
  type: ExternalWalletType;
  provider?: string;
  addressBech32?: string;
  withFullParaAuth?: boolean;
};

export type VerifyExternalWalletParams = {
  /**
   * The external wallet information to verify.
   */
  externalWallet: ExternalWalletInfo;
  /**
   * The signature of the signed verification string.
   */
  signedMessage: string;
  /**
   * For Cosmos wallets, the wallet's public key as a hex string.
   */
  cosmosPublicKeyHex?: string;
  /**
   * For Cosmos wallets, the base64 signer string.
   */
  cosmosSigner?: string;
};

export type LoginExternalWalletResponse =
  | ServerAuthStateLogin
  | (ServerAuthStateVerify & {
      signatureVerificationMessage: string;
    });

export type VerifyTelegramResponse = VerifyThirdPartyAuth;

export type VerifyFarcasterResponse = VerifyThirdPartyAuth | null;

export type ServerAuthState = ServerAuthStateVerify | ServerAuthStateSignup | ServerAuthStateLogin;

export type SignUpOrLogInResponse = ServerAuthStateVerify | ServerAuthStateLogin;

export type Setup2faResponse =
  | {
      /**
       * Indicates whether 2FA has already been set up for the current user.
       */
      isSetup: true;
      uri: undefined;
    }
  | {
      isSetup?: false;
      /**
       * A URI for the user to set up two-factor authentication.
       */
      uri: string;
    };
