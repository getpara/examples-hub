import parsePhoneNumberFromString from 'libphonenumber-js';
import {
  Auth,
  AuthInfo,
  AuthParams,
  PrimaryAuth,
  PrimaryAuthInfo,
  VerifiedAuth,
  WalletParams,
  WalletRef,
} from './types/index.js';

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

export function isEmail(params: AuthParams | undefined): params is Auth<'email'> {
  return (
    !!params &&
    isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId)
  );
}

export function isPhone(params: AuthParams | undefined): params is Auth<'phone'> {
  return (
    !!params &&
    isValid(params.phone) &&
    /^\+\d+$/.test(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.email) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId) &&
    !isValid(params.userId)
  );
}

export function isPhoneLegacy(params: AuthParams | undefined): params is Auth<'phoneLegacy'> {
  return (
    !!params &&
    isValid(params.phone) &&
    isValid(params.countryCode) &&
    !isValid(params.email) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId)
  );
}

export function isFarcaster(params: AuthParams | undefined): params is Auth<'farcaster'> {
  return (
    !!params &&
    isValid(params.farcasterUsername) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.telegramUserId)
  );
}

export function isTelegram(params: AuthParams | undefined): params is Auth<'telegram'> {
  return (
    !!params &&
    isValid(params.telegramUserId) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername)
  );
}

export function isUserId(params: AuthParams | undefined): params is Auth<'userId'> {
  return (
    !!params &&
    isValid(params.userId) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId)
  );
}

export function isPrimary(params: AuthParams | undefined): params is PrimaryAuth {
  return isEmail(params) || isPhone(params) || isFarcaster(params) || isTelegram(params);
}

export function isVerifiedAuth(params: AuthParams | undefined): params is VerifiedAuth {
  return isEmail(params) || isPhone(params);
}

type ExtractAuthOpts = { allowUserId?: boolean; isRequired?: boolean };

export function extractAuthInfo(obj: AuthParams): PrimaryAuthInfo | undefined;
export function extractAuthInfo(
  obj: AuthParams,
  opts: ExtractAuthOpts & { allowUserId: false | undefined },
): PrimaryAuthInfo | undefined;
export function extractAuthInfo(obj: AuthParams, opts: ExtractAuthOpts & { isRequired: true }): PrimaryAuthInfo;
export function extractAuthInfo(obj: AuthParams, opts: ExtractAuthOpts & { allowUserId: true }): AuthInfo | undefined;
export function extractAuthInfo(obj: AuthParams, opts: ExtractAuthOpts & { allowUserId: true; isRequired: true }): AuthInfo;

export function extractAuthInfo(
  obj: AuthParams,
  { allowUserId = false, isRequired = false }: ExtractAuthOpts = {},
): AuthInfo | undefined {
  obj = Object.entries(obj || {}).reduce((acc, [k, v]) => {
    return {
      ...acc,
      ...(!!v && v !== 'null' && v !== 'undefined' && v !== '' ? { [k]: v } : {}),
    };
  }, {});

  let error;

  switch (true) {
    case isEmail(obj):
      return {
        auth: { email: obj.email },
        authType: 'email',
        identifier: obj.email,
      };
    case isPhone(obj):
      if (!parsePhoneNumberFromString(obj.phone)) {
        error = 'invalid phone number';
        break;
      }

      return {
        auth: { phone: obj.phone },
        authType: 'phone',
        identifier: obj.phone,
      };
    case isPhoneLegacy(obj):
      const identifier =
        `${obj.countryCode.startsWith('+') ? '' : '+'}${obj.countryCode}${obj.phone}` as Auth<'phone'>['phone'];

      if (!parsePhoneNumberFromString(identifier)) {
        error = 'invalid phone number';
        break;
      }

      return {
        auth: { phone: identifier },
        authType: 'phone',
        identifier,
      };
    case isFarcaster(obj):
      return {
        auth: { farcasterUsername: obj.farcasterUsername },
        authType: 'farcaster',
        identifier: obj.farcasterUsername,
      };
    case isTelegram(obj):
      return {
        auth: { telegramUserId: obj.telegramUserId },
        authType: 'telegram',
        identifier: obj.telegramUserId,
      };
    case isUserId(obj) && allowUserId:
      return {
        auth: { userId: obj.userId },
        authType: 'userId',
        identifier: obj.userId,
      };
    default:
      break;
  }

  if (isRequired) {
    throw new Error(error ?? 'invalid auth object');
  }
  return undefined;
}
