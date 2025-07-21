import { IconType } from '@getpara/react-components';
import { TLinkedAccountType } from '@getpara/web-sdk';

export const ACCOUNT_TYPES: {
  [key in TLinkedAccountType | string]: {
    logo: IconType;
    logoBranded?: IconType;
    name: string;
    isDark?: boolean;
    inline?: string;
    isExternalWallet?: boolean;
  };
} = {
  'EMAIL': {
    logo: 'mail',
    name: 'Email',
    inline: 'email address',
    isDark: true,
  },
  'PHONE': {
    logo: 'phone',
    name: 'Phone',
    inline: 'phone number',
    isDark: true,
  },
  'EXTERNAL_WALLET': {
    logo: 'wallet',
    name: 'External Wallet',
    inline: 'external wallet',
    isDark: true,
  },
  'GOOGLE': {
    logo: 'google',
    logoBranded: 'googleBrand',
    name: 'Google',
  },
  'TWITTER': {
    logo: 'twitter',
    logoBranded: 'twitterBrand',
    name: 'X / Twitter',
    inline: 'X account',
    isDark: true,
  },
  'APPLE': {
    logo: 'apple',
    logoBranded: 'appleBrand',
    name: 'Apple',
    isDark: true,
  },
  'DISCORD': {
    logo: 'discord',
    logoBranded: 'discordBrand',
    name: 'Discord',
  },
  'FACEBOOK': {
    logo: 'facebook',
    logoBranded: 'facebookBrand',
    name: 'Facebook',
  },
  'FARCASTER': {
    logo: 'farcaster',
    logoBranded: 'farcasterBrand',
    name: 'Farcaster',
  },
  'TELEGRAM': {
    logo: 'telegram',
    logoBranded: 'telegramBrand',
    name: 'Telegram',
  },
  'MetaMask': {
    logo: 'metamask',
    name: 'MetaMask',
    isExternalWallet: true,
  },
  'Rainbow': {
    logo: 'rainbow',
    name: 'Rainbow',
    isExternalWallet: true,
  },
  'Coinbase Wallet': {
    logo: 'coinbase',
    name: 'Coinbase Wallet',
    isExternalWallet: true,
  },
  'WalletConnect': {
    logo: 'walletConnect',
    name: 'WalletConnect',
    isExternalWallet: true,
  },
  'Zerion': {
    logo: 'zerion',
    name: 'Zerion',
    isExternalWallet: true,
  },
  'Safe': {
    logo: 'safe',
    name: 'Safe',
    isExternalWallet: true,
  },
  'Rabby': {
    logo: 'rabby',
    name: 'Rabby',
    isExternalWallet: true,
  },
  'OKX Wallet': {
    logo: 'okx',
    name: 'OKX Wallet',
    isExternalWallet: true,
  },
  'Phantom': {
    logo: 'phantom',
    name: 'Phantom',
    isExternalWallet: true,
  },
  'Glow': {
    logo: 'glow',
    name: 'Glow',
    isExternalWallet: true,
  },
  'Backpack': {
    logo: 'backpack',
    name: 'Backpack',
    isExternalWallet: true,
  },
  'Keplr': {
    logo: 'keplr',
    name: 'Keplr',
    isExternalWallet: true,
  },
  'Leap': {
    logo: 'leap',
    name: 'Leap',
    isExternalWallet: true,
  },
  'HaHa': {
    logo: 'haha',
    name: 'HaHa',
    isExternalWallet: true,
  },
  'Cosmostation': {
    logo: 'cosmostation',
    name: 'Cosmostation',
    isExternalWallet: true,
  },
  'Solflare': {
    logo: 'solflare',
    name: 'Solflare',
    isExternalWallet: true,
  },
  'Valora': {
    logo: 'valora',
    name: 'Valora',
    isExternalWallet: true,
  },
};

export function getAccountTypeName(
  type: TLinkedAccountType | string | undefined,
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
