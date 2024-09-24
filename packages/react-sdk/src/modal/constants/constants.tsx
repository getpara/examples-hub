import { Network, OnRampAsset, OnRampMethod, OnRampProvider } from '@usecapsule/core-sdk';
import { CpslIcon } from '@usecapsule/react-components';
import { Transition, Variants } from 'framer-motion';

export const CAPSULE_CONNECT = 'https://connect.usecapsule.com/';
export const CAPSULE_TERMS_AND_CONDITIONS =
  'https://capsule-org.notion.site/Terms-and-Conditions-d4a23d32c6a64acba9cec29a11cc09e9';

export interface OnRampProviderConfig {
  name: string;
  feeLower: number;
  feeUpper?: number;
  methods: OnRampMethod[];
  icon: JSX.Element;
  backgroundColors: string[];
}

export const ON_RAMP_PROVIDERS: Record<OnRampProvider, OnRampProviderConfig> = {
  [OnRampProvider.STRIPE]: {
    name: 'Stripe',
    feeLower: 0.99,
    feeUpper: 4.49,
    methods: [OnRampMethod.ACH, OnRampMethod.DEBIT, OnRampMethod.CREDIT],
    icon: <CpslIcon icon="stripeBrand" />,
    backgroundColors: ['#6772E5', '#808AF4'],
  },
  [OnRampProvider.RAMP]: {
    name: 'Ramp',
    feeLower: 0.99,
    feeUpper: 4.49,
    methods: [OnRampMethod.ACH, OnRampMethod.DEBIT, OnRampMethod.CREDIT],
    icon: <CpslIcon icon="rampNetworkBrand" />,
    backgroundColors: ['#21BF73', '#3AE492'],
  },
  [OnRampProvider.MOONPAY]: {
    name: 'MoonPay',
    feeLower: 1.0,
    feeUpper: 4.5,
    methods: [OnRampMethod.ACH, OnRampMethod.DEBIT, OnRampMethod.CREDIT],
    icon: <CpslIcon icon="moonpayBrand" />,
    backgroundColors: ['#7715F5', '#9647fd'],
  },
};

export const NETWORKS: Record<Network, string> = {
  [Network.ETHEREUM]: 'Ethereum',
  [Network.SEPOLIA]: 'Sepolia',
  [Network.ARBITRUM]: 'Arbitrum',
  [Network.BASE]: 'Base',
  [Network.OPTIMISM]: 'Optimism',
  [Network.POLYGON]: 'Polygon',
  [Network.SOLANA]: 'Solana',
  [Network.COSMOS]: 'Cosmos',
  [Network.CELO]: 'Celo',
};

export const ON_RAMP_ASSETS: Record<OnRampAsset, [string, string]> = {
  [OnRampAsset.ETHEREUM]: ['Ethereum', 'ETH'],
  [OnRampAsset.USDC]: ['USDC', 'USDC'],
  [OnRampAsset.POLYGON]: ['Polygon', 'MATIC'],
  [OnRampAsset.SOLANA]: ['Solana', 'SOL'],
  [OnRampAsset.ATOM]: ['Atom', 'ATOM'],
  [OnRampAsset.CELO]: ['Celo', 'CELO'],
};

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
