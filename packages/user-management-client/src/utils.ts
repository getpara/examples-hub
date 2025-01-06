import { $Auth, Auth, AuthParams, ExtractAuth, WalletParams, WalletRef } from './types/index.js';

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

export function isEmail(params: AuthParams): params is $Auth<'email'> {
  return !!params.email && !params.phone && !params.countryCode && !params.farcasterUsername;
}

export function isPhone(params: AuthParams): params is $Auth<'phone'> {
  return !!params.phone && !!params.countryCode && !params.email && !params.farcasterUsername;
}

export function isFarcaster(params: AuthParams): params is $Auth<'farcasterUsername'> {
  return !!params.farcasterUsername && !params.email && !params.phone && !params.countryCode;
}

export function isUserId(params: AuthParams): params is { userId: string } {
  return !!params.userId;
}

export function extractAuthInfo(obj: AuthParams, { allowUserId }: { allowUserId?: boolean } = {}): ExtractAuth {
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
    case isUserId(obj) && allowUserId:
      return { auth: { userId: obj.userId }, authType: 'userId', identifier: obj.userId };
    default:
      throw new Error('invalid auth object');
  }
}

export function extractAuth(
  obj: AuthParams,
  opts: Parameters<typeof extractAuthInfo>[1] & { optional?: boolean } = {},
): Auth | undefined {
  try {
    return extractAuthInfo(obj, { allowUserId: opts.allowUserId || false }).auth;
  } catch (e) {
    if (opts.optional) {
      return undefined;
    }

    throw e;
  }
}
