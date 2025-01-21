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

function isValid(s?: string | null | undefined): boolean {
  return !!s && s !== 'null' && s !== 'undefined' && s !== '';
}

export function isEmail(params: AuthParams): params is $Auth<'email'> {
  return (
    isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId)
  );
}

export function isPhone(params: AuthParams): params is $Auth<'phone'> {
  return (
    isValid(params.phone) &&
    isValid(params.countryCode) &&
    !isValid(params.email) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId)
  );
}

export function isFarcaster(params: AuthParams): params is $Auth<'farcaster'> {
  return (
    isValid(params.farcasterUsername) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.telegramUserId)
  );
}

export function isTelegram(params: AuthParams): params is $Auth<'telegram'> {
  return (
    isValid(params.telegramUserId) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername)
  );
}

export function isUserId(params: AuthParams): params is $Auth<'userId'> {
  return (
    isValid(params.userId) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId)
  );
}

export function extractAuthInfo(obj: AuthParams, { allowUserId }: { allowUserId?: boolean } = {}): ExtractAuth {
  switch (true) {
    case isEmail(obj):
      return { auth: { email: obj.email }, authType: 'email', identifier: obj.email, publicKeyIdentifier: obj.email };
    case isPhone(obj):
      return {
        auth: { phone: obj.phone, countryCode: obj.countryCode },
        authType: 'phone',
        identifier: `${obj.countryCode}${obj.phone}`,
        publicKeyIdentifier: `${obj.countryCode}${obj.phone}`,
      };
    case isFarcaster(obj):
      return {
        auth: { farcasterUsername: obj.farcasterUsername },
        authType: 'farcaster',
        identifier: obj.farcasterUsername,
        publicKeyIdentifier: `${obj.farcasterUsername}-farcaster`,
      };
    case isTelegram(obj):
      return {
        auth: { telegramUserId: obj.telegramUserId },
        authType: 'telegram',
        identifier: obj.telegramUserId,
        publicKeyIdentifier: `${obj.telegramUserId}-telegram`,
      };
    case isUserId(obj) && allowUserId:
      return { auth: { userId: obj.userId }, authType: 'userId', identifier: obj.userId, publicKeyIdentifier: obj.userId };
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
