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
