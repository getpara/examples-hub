import { AuthStateLogin, AuthStateVerify, TWalletType } from '@getpara/web-sdk';

export type WalletMetadata = {
  id: string;
  name: string;
  iconUrl: string;
  rdns?: string;
  installed?: boolean;
  isExtension?: boolean;
  isMobile?: boolean;
  isWeb?: boolean;
  downloadUrl?: string;
  getQrUri?: () => Promise<string>;
  downloadUrls?: {
    android?: string;
    ios?: string;
    mobile?: string;
    qrCode?: string;
    chrome?: string;
    edge?: string;
    firefox?: string;
    opera?: string;
    safari?: string;
    browserExtension?: string;
    macos?: string;
    windows?: string;
    linux?: string;
    desktop?: string;
  };
};

export type CommonWallet = {
  connect: (isConnectionOnly?: boolean) => Promise<{
    address?: string;
    ethAddress?: string;
    error?: string;
    authState?: AuthStateLogin | AuthStateVerify;
  }>;
  connectMobile: (
    isManualWalletConnect?: boolean,
    isConnectionOnly?: boolean,
  ) => Promise<{ address?: string; ethAddress?: string; error?: string; authState?: AuthStateLogin | AuthStateVerify }>;
  type: TWalletType;
} & WalletMetadata;

export type CommonChain = {
  id: string | number;
  name: string;
};

export enum EvmWallet {
  METAMASK = 'METAMASK',
  RAINBOW = 'RAINBOW',
  COINBASE = 'COINBASE',
  WALLETCONNECT = 'WALLETCONNECT',
  ZERION = 'ZERION',
  SAFE = 'SAFE',
  RABBY = 'RABBY',
  OKX = 'OKX',
}

export enum SolanaWallet {
  PHANTOM = 'PHANTOM',
  GLOW = 'GLOW',
  BACKPACK = 'BACKPACK',
  SOLFLARE = 'SOLFLARE',
}

export enum CosmosWallet {
  KEPLR = 'KEPLR',
  LEAP = 'LEAP',
}

export const ExternalWallet = {
  ...EvmWallet,
  ...SolanaWallet,
  ...CosmosWallet,
};

export type TExternalWallet = keyof typeof ExternalWallet;
