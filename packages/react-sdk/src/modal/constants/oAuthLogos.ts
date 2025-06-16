import { TExternalWallet } from '@getpara/web-sdk';
import { IconType } from '@getpara/react-components';
import { TLinkedAccountType } from '@getpara/web-sdk';

export const ACCOUNT_TYPES: {
  [key in TLinkedAccountType | TExternalWallet]: {
    logo: IconType;
    logoBranded?: IconType;
    name: string;
    isDark?: boolean;
    inline?: string;
    isExternalWallet?: boolean;
  };
} = {
  EMAIL: {
    logo: 'mail',
    name: 'Email',
    inline: 'email address',
    isDark: true,
  },
  PHONE: {
    logo: 'phone',
    name: 'Phone',
    inline: 'phone number',
    isDark: true,
  },
  EXTERNAL_WALLET: {
    logo: 'wallet',
    name: 'External Wallet',
    inline: 'external wallet',
    isDark: true,
  },
  GOOGLE: {
    logo: 'google',
    logoBranded: 'googleBrand',
    name: 'Google',
  },
  TWITTER: {
    logo: 'twitter',
    logoBranded: 'twitterBrand',
    name: 'X / Twitter',
    inline: 'X account',
    isDark: true,
  },
  APPLE: {
    logo: 'apple',
    logoBranded: 'appleBrand',
    name: 'Apple',
    isDark: true,
  },
  DISCORD: {
    logo: 'discord',
    logoBranded: 'discordBrand',
    name: 'Discord',
  },
  FACEBOOK: {
    logo: 'facebook',
    logoBranded: 'facebookBrand',
    name: 'Facebook',
  },
  FARCASTER: {
    logo: 'farcaster',
    logoBranded: 'farcasterBrand',
    name: 'Farcaster',
  },
  TELEGRAM: {
    logo: 'telegram',
    logoBranded: 'telegramBrand',
    name: 'Telegram',
  },
  METAMASK: {
    logo: 'metamask',
    name: 'MetaMask',
    isExternalWallet: true,
  },
  RAINBOW: {
    logo: 'rainbow',
    name: 'Rainbow',
    isExternalWallet: true,
  },
  COINBASE: {
    logo: 'coinbase',
    name: 'Coinbase Wallet',
    isExternalWallet: true,
  },
  WALLETCONNECT: {
    logo: 'walletConnect',
    name: 'WalletConnect',
    isExternalWallet: true,
  },
  ZERION: {
    logo: 'zerion',
    name: 'Zerion',
    isExternalWallet: true,
  },
  SAFE: {
    logo: 'safe',
    name: 'Safe',
    isExternalWallet: true,
  },
  RABBY: {
    logo: 'rabby',
    name: 'Rabby',
    isExternalWallet: true,
  },
  OKX: {
    logo: 'okx',
    name: 'OKX',
    isExternalWallet: true,
  },
  PHANTOM: {
    logo: 'phantom',
    name: 'Phantom',
    isExternalWallet: true,
  },
  GLOW: {
    logo: 'glow',
    name: 'Glow',
    isExternalWallet: true,
  },
  BACKPACK: {
    logo: 'backpack',
    name: 'Backpack',
    isExternalWallet: true,
  },
  KEPLR: {
    logo: 'keplr',
    name: 'Keplr',
    isExternalWallet: true,
  },
  LEAP: {
    logo: 'leap',
    name: 'Leap',
    isExternalWallet: true,
  },
  HAHA: {
    logo: 'haha',
    name: 'HaHa',
    isExternalWallet: true,
  },
  COSMOSTATION: {
    logo: 'cosmostation',
    name: 'Cosmostation',
    isExternalWallet: true,
  },
  SOLFLARE: {
    logo: 'solflare',
    name: 'Solflare',
    isExternalWallet: true,
  },
};

export function getAccountTypeName(
  type: TLinkedAccountType | TExternalWallet | undefined,
  { inline = false }: { inline?: boolean } = {},
): string | undefined {
  const data = type ? ACCOUNT_TYPES[type] : undefined;
  return data
    ? inline
      ? (data.inline ?? `${data.name} ${data.isExternalWallet ? 'wallet' : 'account'}`)
      : data.name
    : undefined;
}

export function getAccountTypeLogo(type: TLinkedAccountType | undefined): IconType | undefined {
  return type ? ACCOUNT_TYPES[type]!.logoBranded || ACCOUNT_TYPES[type]!.logo : undefined;
}
