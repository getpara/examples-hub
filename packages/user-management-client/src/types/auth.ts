export type AuthType = 'email' | 'phone' | 'farcasterUsername' | 'userId';

export type ExtractAuth =
  | $ExtractAuth<'email'>
  | $ExtractAuth<'phone'>
  | $ExtractAuth<'farcasterUsername'>
  | $ExtractAuth<'userId'>;

export type $ExtractAuth<T extends AuthType> = {
  auth: $Auth<T>;
  authType: T;
  identifier: string;
};

export type AuthParams = Record<string, any> & {
  email?: string;
  phone?: string;
  countryCode?: string;
  farcasterUsername?: string;
  userId?: string;
};

export type $Auth<T extends AuthType> = T extends 'email'
  ? { email: string }
  : T extends 'phone'
    ? { phone: string; countryCode: string }
    : T extends 'farcasterUsername'
      ? { farcasterUsername: string }
      : { userId: string };

export type Auth = $Auth<'email'> | $Auth<'phone'> | $Auth<'farcasterUsername'> | $Auth<'userId'>;

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
}

export type BiometricLocationHint = { useragent?: string; aaguid?: string };
