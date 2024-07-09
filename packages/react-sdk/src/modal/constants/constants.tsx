import { Network, OnRampMethod, OnRampProvider } from '@usecapsule/core-sdk';
import { StripeIcon, RampIcon } from '../components/OnRampComponents/icons.js';

export const CAPSULE_CONNECT = 'https://connect.usecapsule.com/';

export const ON_RAMP_PROVIDERS: Record<
  OnRampProvider,
  { name: string; feeLower: number; feeUpper?: number; methods: OnRampMethod[]; icon: React.ReactNode }
> = {
  [OnRampProvider.STRIPE]: {
    name: 'Stripe',
    feeLower: 0.99,
    feeUpper: 4.49,
    methods: [OnRampMethod.ACH, OnRampMethod.DEBIT, OnRampMethod.CREDIT],
    // TODO: Move to @capsule-org/core-components
    icon: StripeIcon,
  },
  [OnRampProvider.RAMP]: {
    name: 'Ramp',
    feeLower: 0.99,
    feeUpper: 4.49,
    methods: [OnRampMethod.ACH, OnRampMethod.DEBIT, OnRampMethod.CREDIT],
    icon: RampIcon,
  },
  // [OnRampProvider.DECENT]: {
  //   name: 'Decent',
  //   feeLower: 0,
  //   methods: [OnRampMethod.ACH, OnRampMethod.DEBIT, OnRampMethod.CREDIT],
  //   icon: <CpslIcon icon="decentBrand" />,
  // },
};

export const NETWORKS: Record<Network, string> = {
  [Network.ETHEREUM]: 'Ethereum',
  [Network.ARBITRUM]: 'Arbitrum',
  [Network.BASE]: 'Base',
  [Network.OPTIMISM]: 'Optimism',
  [Network.POLYGON]: 'Polygon',
};
