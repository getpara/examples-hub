import { IconType } from '@getpara/react-components';
import { TLinkedAccountType } from '@getpara/web-sdk';
import { DisplayMetadata } from '../types/commonTypes.js';

export const ACCOUNT_TYPES: {
  [key in TLinkedAccountType | string]: DisplayMetadata & {
    isExternalWallet?: boolean;
  };
} = {
  'EMAIL': {
    icon: 'mail',
    name: 'Email',
    inlineText: 'email address',
    isPlain: true,
  },
  'PHONE': {
    icon: 'phone',
    name: 'Phone',
    inlineText: 'phone number',
    isPlain: true,
  },
  'EXTERNAL_WALLET': {
    icon: 'wallet',
    name: 'External Wallet',
    inlineText: 'external wallet',
    isPlain: true,
  },
  'GOOGLE': {
    icon: 'google',
    iconBranded: 'googleBrand',
    name: 'Google',
  },
  'TWITTER': {
    icon: 'twitter',
    // Not using branded here to ensure the icon looks correct in dark mode
    iconBranded: 'twitter',
    name: 'X / Twitter',
    inlineText: 'X account',
    isDark: true,
  },
  'APPLE': {
    icon: 'apple',
    // Not using branded here to ensure the icon looks correct in dark mode
    iconBranded: 'apple',
    name: 'Apple',
    isDark: true,
  },
  'DISCORD': {
    icon: 'discord',
    iconBranded: 'discordBrand',
    name: 'Discord',
  },
  'FACEBOOK': {
    icon: 'facebook',
    iconBranded: 'facebookBrand',
    name: 'Facebook',
  },
  'FARCASTER': {
    icon: 'farcaster',
    iconBranded: 'farcasterBrand',
    name: 'Farcaster',
  },
  'TELEGRAM': {
    icon: 'telegram',
    iconBranded: 'telegramBrand',
    name: 'Telegram',
  },
  'MetaMask': {
    icon: 'metamask',
    name: 'MetaMask',
    isExternalWallet: true,
  },
  'Rainbow': {
    icon: 'rainbow',
    name: 'Rainbow',
    isExternalWallet: true,
  },
  'Coinbase Wallet': {
    icon: 'coinbase',
    name: 'Coinbase Wallet',
    isExternalWallet: true,
  },
  'WalletConnect': {
    icon: 'walletConnect',
    name: 'WalletConnect',
    isExternalWallet: true,
  },
  'Zerion': {
    icon: 'zerion',
    name: 'Zerion',
    isExternalWallet: true,
  },
  'Safe': {
    icon: 'safe',
    name: 'Safe',
    isExternalWallet: true,
  },
  'Rabby': {
    icon: 'rabby',
    name: 'Rabby',
    isExternalWallet: true,
  },
  'OKX Wallet': {
    icon: 'okx',
    name: 'OKX Wallet',
    isExternalWallet: true,
  },
  'Phantom': {
    icon: 'phantom',
    name: 'Phantom',
    isExternalWallet: true,
  },
  'Glow': {
    icon: 'glow',
    name: 'Glow',
    isExternalWallet: true,
  },
  'Backpack': {
    icon: 'backpack',
    name: 'Backpack',
    isExternalWallet: true,
  },
  'Keplr': {
    icon: 'keplr',
    name: 'Keplr',
    isExternalWallet: true,
  },
  'Leap': {
    icon: 'leap',
    name: 'Leap',
    isExternalWallet: true,
  },
  'HaHa': {
    icon: 'haha',
    name: 'HaHa',
    isExternalWallet: true,
  },
  'Cosmostation': {
    icon: 'cosmostation',
    name: 'Cosmostation',
    isExternalWallet: true,
  },
  'Solflare': {
    icon: 'solflare',
    name: 'Solflare',
    isExternalWallet: true,
  },
  'Valora': {
    icon: 'valora',
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
      ? (data.inlineText ?? `${data.name} ${data.isExternalWallet ? 'wallet' : 'account'}`)
      : data.name
    : undefined;
}

export function getAccountTypeLogo(type: TLinkedAccountType | undefined): IconType | undefined {
  return type ? ACCOUNT_TYPES[type]!.iconBranded || ACCOUNT_TYPES[type]!.icon : undefined;
}
