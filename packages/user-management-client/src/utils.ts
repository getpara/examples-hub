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
import {
  AccountMetadata,
  AccountMetadataKey,
  PregenAuth,
  PregenAuthInfo,
  PregenAuthType,
  PregenOrGuestAuth,
} from './types/auth.js';
import { PregenIds, TPregenIdentifierType } from './types/wallet.js';

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
    !isValid(params.telegramUserId) &&
    !isValid(params.xUsername) &&
    !isValid(params.discordUsername) &&
    !isValid(params.customId) &&
    !isValid(params.externalWalletAddress)
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
    !isValid(params.xUsername) &&
    !isValid(params.discordUsername) &&
    !isValid(params.customId) &&
    !isValid(params.userId) &&
    !isValid(params.externalWalletAddress)
  );
}

export function isPhoneLegacy(params: AuthParams | undefined): params is Auth<'phoneLegacy'> {
  return (
    !!params &&
    isValid(params.phone) &&
    isValid(params.countryCode) &&
    !isValid(params.email) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId) &&
    !isValid(params.xUsername) &&
    !isValid(params.discordUsername) &&
    !isValid(params.customId) &&
    !isValid(params.externalWalletAddress)
  );
}

export function isFarcaster(params: AuthParams | undefined): params is Auth<'farcaster'> {
  return (
    !!params &&
    isValid(params.farcasterUsername) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.telegramUserId) &&
    !isValid(params.xUsername) &&
    !isValid(params.discordUsername) &&
    !isValid(params.customId) &&
    !isValid(params.externalWalletAddress)
  );
}

export function isTelegram(params: AuthParams | undefined): params is Auth<'telegram'> {
  return (
    !!params &&
    isValid(params.telegramUserId) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.xUsername) &&
    !isValid(params.discordUsername) &&
    !isValid(params.customId) &&
    !isValid(params.externalWalletAddress)
  );
}

export function isExternalWallet(params: AuthParams | undefined): params is Auth<'externalWallet'> {
  return (
    !!params &&
    isValid(params.externalWalletAddress) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId) &&
    !isValid(params.xUsername) &&
    !isValid(params.discordUsername) &&
    !isValid(params.customId)
  );
}

export function isX(params: AuthParams | undefined): params is Auth<'x'> {
  return (
    !!params &&
    isValid(params.xUsername) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId) &&
    !isValid(params.discordUsername) &&
    !isValid(params.customId) &&
    !isValid(params.externalWalletAddress)
  );
}

export function isDiscord(params: AuthParams | undefined): params is Auth<'discord'> {
  return (
    !!params &&
    isValid(params.discordUsername) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId) &&
    !isValid(params.xUsername) &&
    !isValid(params.customId) &&
    !isValid(params.externalWalletAddress)
  );
}

export function isCustomId(params: AuthParams | undefined): params is Auth<'customId'> {
  return (
    !!params &&
    isValid(params.customId) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.telegramUserId) &&
    !isValid(params.xUsername) &&
    !isValid(params.discordUsername) &&
    !isValid(params.externalWalletAddress)
  );
}

export function isGuestId(params: AuthParams | undefined): params is Auth<'guestId'> {
  return (
    !!params &&
    isValid(params.guestId) &&
    !isValid(params.email) &&
    !isValid(params.phone) &&
    !isValid(params.countryCode) &&
    !isValid(params.farcasterUsername) &&
    !isValid(params.xUsername) &&
    !isValid(params.discordUsername) &&
    !isValid(params.customId) &&
    !isValid(params.externalWalletAddress)
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
    !isValid(params.xUsername) &&
    !isValid(params.discordUsername) &&
    !isValid(params.customId) &&
    !isValid(params.telegramUserId) &&
    !isValid(params.externalWalletAddress)
  );
}

export function isPrimary(params: AuthParams | undefined): params is PrimaryAuth {
  return isEmail(params) || isPhone(params) || isFarcaster(params) || isTelegram(params) || isExternalWallet(params);
}

export function isVerifiedAuth(params: AuthParams | undefined): params is VerifiedAuth {
  return isEmail(params) || isPhone(params);
}

export function isPregenAuth(params: AuthParams | undefined): params is PregenAuth {
  return (isPrimary(params) && !isExternalWallet(params)) || isX(params) || isDiscord(params) || isCustomId(params);
}

type ExtractAuthOpts = { allowUserId?: boolean; allowPregen?: boolean; isRequired?: boolean };

export function extractAuthInfo(obj: AuthParams): PrimaryAuthInfo | undefined;
export function extractAuthInfo(
  obj: AuthParams,
  opts: ExtractAuthOpts & { allowUserId: false | undefined },
): PrimaryAuthInfo | undefined;
export function extractAuthInfo(
  obj: AuthParams,
  opts: ExtractAuthOpts & { isRequired: true; allowPregen?: undefined | false },
): PrimaryAuthInfo;
export function extractAuthInfo(
  obj: AuthParams,
  opts: ExtractAuthOpts & { allowUserId: true },
): PrimaryAuthInfo | AuthInfo<'userId'> | undefined;
export function extractAuthInfo(
  obj: AuthParams,
  opts: ExtractAuthOpts & { allowUserId: true; isRequired: true },
): PrimaryAuthInfo | AuthInfo<'userId'>;
export function extractAuthInfo(obj: AuthParams, opts: ExtractAuthOpts & { allowPregen: true }): PregenAuthInfo | undefined;
export function extractAuthInfo(
  obj: AuthParams,
  opts: ExtractAuthOpts & { allowPregen: true; isRequired: true },
): PregenAuthInfo;

export function extractAuthInfo(
  obj: AuthParams,
  { allowUserId = false, allowPregen = false, isRequired = false }: ExtractAuthOpts = {},
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
    case isExternalWallet(obj):
      return {
        auth: { externalWalletAddress: obj.externalWalletAddress },
        authType: 'externalWallet',
        identifier: obj.externalWalletAddress,
      };
    case allowPregen && isX(obj):
      return {
        auth: { xUsername: obj.xUsername },
        authType: 'x',
        identifier: obj.xUsername,
      };
    case allowPregen && isDiscord(obj):
      return {
        auth: { discordUsername: obj.discordUsername },
        authType: 'discord',
        identifier: obj.discordUsername,
      };
    case allowPregen && isCustomId(obj):
      return {
        auth: { customId: obj.customId },
        authType: 'customId',
        identifier: obj.customId,
      };
    case allowPregen && isGuestId(obj):
      return {
        auth: { guestId: obj.guestId },
        authType: 'guestId',
        identifier: obj.guestId,
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

export function toPregenTypeAndId(auth: PregenOrGuestAuth): [TPregenIdentifierType, string] {
  const { authType, identifier: pregenIdentifier } = extractAuthInfo(auth, { isRequired: true, allowPregen: true });

  const pregenIdentifierType = (<Record<PregenAuthType | 'guestId', TPregenIdentifierType>>{
    email: 'EMAIL',
    phone: 'PHONE',
    farcaster: 'FARCASTER',
    telegram: 'TELEGRAM',
    discord: 'DISCORD',
    x: 'TWITTER',
    customId: 'CUSTOM_ID',
    guestId: 'GUEST_ID',
  })[authType];

  return [pregenIdentifierType, pregenIdentifier];
}

export function toPregenIds(auth: PregenAuth): PregenIds {
  const [pregenIdentifierType, pregenIdentifier] = toPregenTypeAndId(auth);

  return { [pregenIdentifierType]: [pregenIdentifier] };
}

export function fromAccountMetadata(
  obj: Partial<Record<AccountMetadataKey, { date: string; metadata: object }>> | undefined,
): AccountMetadata {
  return Object.entries(obj || {}).reduce(
    (acc: AccountMetadata, [method, obj]) => ({
      ...acc,
      [method]: {
        ...obj,
        date: new Date(obj.date),
      },
    }),
    {},
  );
}
