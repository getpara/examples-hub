import { CurrentWalletIds, SupportedWalletTypes } from './wallet.js';

export type AuthType = 'email' | 'phone' | 'phoneLegacy' | 'farcaster' | 'telegram' | 'userId';

export type PrimaryAuthType = Extract<AuthType, 'email' | 'phone' | 'farcaster' | 'telegram'>;

export type VerifiedAuthType = Extract<PrimaryAuthType, 'email' | 'phone'>;

export type AuthIdentifier<T extends AuthType | never> = T extends 'phone' ? `+${number}` : string;

export type AuthInfo<T extends Exclude<AuthType, 'phoneLegacy'> = Exclude<AuthType, 'phoneLegacy'>> = {
  auth: Auth<T>;
  authType: T;
  identifier: AuthIdentifier<T>;
};

export type PrimaryAuthInfo = AuthInfo<PrimaryAuthType>;

export type VerifiedAuthInfo = AuthInfo<VerifiedAuthType>;

export type AuthParams = Record<string, any> & {
  email?: string;
  phone?: string;
  countryCode?: string;
  farcasterUsername?: string;
  telegramUserId?: string;
  userId?: string;
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
          : { userId: AuthIdentifier<'userId'> };

export type PrimaryAuth = Auth<PrimaryAuthType>;

export type VerifiedAuth = Auth<VerifiedAuthType>;

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
