type WalletRef = 'walletId' | 'externalWalletAddress';

export type WalletParams = Partial<{ walletId?: string; externalWalletAddress?: string }>;

export function isWalletId(params: WalletParams): params is { walletId: string } {
  return !!params.walletId && !params.externalWalletAddress;
}

export function isExternalWalletAddress(params: WalletParams): params is { externalWalletAddress: string } {
  return !!params.externalWalletAddress && !params.walletId;
}

export function extractWalletRef(params: WalletParams): [WalletRef, string] {
  if (isWalletId(params)) {
    return ['walletId', params.walletId];
  } else if (isExternalWalletAddress(params)) {
    return ['externalWalletAddress', params.externalWalletAddress];
  }

  throw new Error('invalid wallet params');
}

export type AuthType = 'email' | 'phone' | 'farcasterUsername';

export type ExtractAuth = ExtractAuthT<'email'> | ExtractAuthT<'phone'> | ExtractAuthT<'farcasterUsername'>;

export type ExtractAuthT<T extends AuthType> = {
  auth: $Auth<T>;
  authType: T;
  identifier: string;
};

export type AuthParams = Record<string, any> & {
  email?: string;
  phone?: string;
  countryCode?: string;
  farcasterUsername?: string;
};

export type $Auth<T extends AuthType> = T extends 'email'
  ? { email: string }
  : T extends 'phone'
    ? { phone: string; countryCode: string }
    : { farcasterUsername: string };

export type Auth = $Auth<'email'> | $Auth<'phone'> | $Auth<'farcasterUsername'>;

export type WithAuth = {
  auth: Auth;
};

export function isEmail(params: AuthParams): params is $Auth<'email'> {
  return !!params.email && !params.phone && !params.countryCode && !params.farcasterUsername;
}

export function isPhone(params: AuthParams): params is $Auth<'phone'> {
  return !!params.phone && !!params.countryCode && !params.email && !params.farcasterUsername;
}

export function isFarcaster(params: AuthParams): params is $Auth<'farcasterUsername'> {
  return !!params.farcasterUsername && !params.email && !params.phone && !params.countryCode;
}

export function extractAuthInfo(obj: AuthParams): ExtractAuth {
  switch (true) {
    case isEmail(obj):
      return { auth: { email: obj.email }, authType: 'email', identifier: obj.email };
    case isPhone(obj):
      return {
        auth: { phone: obj.phone, countryCode: obj.countryCode },
        authType: 'phone',
        identifier: `${obj.countryCode}${obj.phone}`,
      };
    case isFarcaster(obj):
      return {
        auth: { farcasterUsername: obj.farcasterUsername },
        authType: 'farcasterUsername',
        identifier: obj.farcasterUsername,
      };
    default:
      throw new Error('invalid auth object');
  }
}

export function extractAuth(obj: AuthParams): Auth {
  return extractAuthInfo(obj).auth;
}

export enum OAuthMethod {
  GOOGLE = 'GOOGLE',
  TWITTER = 'TWITTER',
  APPLE = 'APPLE',
  DISCORD = 'DISCORD',
  FACEBOOK = 'FACEBOOK',
  FARCASTER = 'FARCASTER',
}

export const PREGEN_IDENTIFIER_TYPES = ['EMAIL', 'PHONE', 'CUSTOM_ID', OAuthMethod.DISCORD, OAuthMethod.TWITTER] as const;

export type TPregenIdentifierType = (typeof PREGEN_IDENTIFIER_TYPES)[number];

export type PregenIds = Partial<Record<TPregenIdentifierType, string[]>>;
