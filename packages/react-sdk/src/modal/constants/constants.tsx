import { Network, OnRampAsset, OnRampMethod, OnRampProvider } from '@getpara/core-sdk';
import { IconType } from '@getpara/react-components';
import { Transition, Variants } from 'framer-motion';

export const PARA_CONNECT = 'https://connect.getpara.com/';
export const PARA_TERMS_AND_CONDITIONS = 'https://getpara.com/terms';

export interface OnRampProviderConfig {
  name: string;
  feeLower: number;
  feeUpper?: number;
  methods: OnRampMethod[];
  icon: IconType;
  backgroundColors: string[];
}

export const ON_RAMP_PROVIDERS: Record<OnRampProvider, OnRampProviderConfig> = {
  [OnRampProvider.STRIPE]: {
    name: 'Stripe',
    feeLower: 0.99,
    feeUpper: 4.49,
    methods: [OnRampMethod.ACH, OnRampMethod.DEBIT, OnRampMethod.CREDIT],
    icon: 'stripeBrand',
    backgroundColors: ['#6772E5', '#808AF4'],
  },
  [OnRampProvider.RAMP]: {
    name: 'Ramp',
    feeLower: 0.99,
    feeUpper: 4.49,
    methods: [OnRampMethod.ACH, OnRampMethod.DEBIT, OnRampMethod.CREDIT],
    icon: 'rampNetworkBrand',
    backgroundColors: ['#21BF73', '#3AE492'],
  },
  [OnRampProvider.MOONPAY]: {
    name: 'MoonPay',
    feeLower: 1.0,
    feeUpper: 4.5,
    methods: [OnRampMethod.ACH, OnRampMethod.DEBIT, OnRampMethod.CREDIT],
    icon: 'moonpayBrand',
    backgroundColors: ['#7715F5', '#9647fd'],
  },
};

export const NETWORKS: Record<Network, { name: string; icon: IconType }> = {
  [Network.ETHEREUM]: { name: 'Ethereum', icon: 'ethereum' },
  [Network.SEPOLIA]: { name: 'Sepolia', icon: 'ethereum' },
  [Network.ARBITRUM]: { name: 'Arbitrum', icon: 'arbitrumBrand' },
  [Network.BASE]: { name: 'Base', icon: 'baseBrand' },
  [Network.OPTIMISM]: { name: 'Optimism', icon: 'optimismBrand' },
  [Network.POLYGON]: { name: 'Polygon', icon: 'polygonBrand' },
  [Network.SOLANA]: { name: 'Solana', icon: 'solana' },
  [Network.COSMOS]: { name: 'Cosmos', icon: 'cosmos' },
  [Network.CELO]: { name: 'Celo', icon: 'celoBrand' },
  [Network.NOBLE]: { name: 'Noble', icon: 'nobleBrand' },
};

export const ON_RAMP_ASSETS: Record<OnRampAsset, { name: string; code: string; icon: IconType }> = {
  [OnRampAsset.ETHEREUM]: { name: 'Ethereum', code: 'ETH', icon: 'ethereum' },
  [OnRampAsset.USDC]: { name: 'USDC', code: 'USDC', icon: 'usdcBrand' },
  [OnRampAsset.POLYGON]: { name: 'Polygon', code: 'MATIC', icon: 'polygonBrand' },
  [OnRampAsset.SOLANA]: { name: 'Solana', code: 'SOL', icon: 'solana' },
  [OnRampAsset.ATOM]: { name: 'Atom', code: 'ATOM', icon: 'cosmos' },
  [OnRampAsset.CELO]: { name: 'Celo', code: 'CELO', icon: 'celoBrand' },
  [OnRampAsset.TETHER]: { name: 'Tether', code: 'USDT', icon: 'tetherBrand' },
  [OnRampAsset.CUSD]: { name: 'Celo Dollar', code: 'CUSD', icon: 'celoBrand' },
  [OnRampAsset.CEUR]: { name: 'Celo Euro', code: 'CEUR', icon: 'celoBrand' },
  [OnRampAsset.CREAL]: { name: 'Celo Real', code: 'CREAL', icon: 'celoBrand' },
};

export function getNetworkName(str: Network | string) {
  return NETWORKS[str as Network]?.name ?? `${str[0]}${str.slice(1).toLowerCase()}`;
}

export function getNetworkIcon(str: Network | string): IconType {
  return NETWORKS[str as Network]?.icon ?? 'globe';
}

export function getAssetName(str: OnRampAsset | string) {
  return ON_RAMP_ASSETS[str as OnRampAsset]?.code ?? str;
}

export function getAssetIcon(str: OnRampAsset | string) {
  return ON_RAMP_ASSETS[str as OnRampAsset]?.icon ?? 'emptyCircle';
}

export const MOBILE_SIZE = 480;

export const NETWORK_NOT_SUPPORTED_ERROR = 'network not supported';

export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const BODY_MOTION_VARIANTS: Variants = {
  enter: (direction: number) => {
    return {
      scale: direction > 0 ? 0.9 : 1.1,
      opacity: 0,
    };
  },
  center: {
    scale: 1,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      scale: direction < 0 ? 0.9 : 1.1,
      opacity: 0,
    };
  },
};

export const BODY_TRANSITION: Transition = {
  duration: 0.2,
};
