import { Buffer as NodeBuffer } from 'buffer';
if (typeof global !== 'undefined') {
  global.Buffer = global.Buffer || NodeBuffer;
} else if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || NodeBuffer;
  window.global = window.global || window;
} else {
  self.Buffer = self.Buffer || NodeBuffer;
  self.global = self.global || self;
}

import Client, {
  Network,
  OnRampAsset,
  OnRampProvider,
  OnRampPurchase,
  OnRampPurchaseStatus,
  WalletScheme,
  WalletType,
} from '@usecapsule/user-management-client';
import { AxiosInstance } from 'axios';

export { Network, OnRampAsset, OnRampProvider, OnRampPurchaseStatus, type OnRampPurchase };

export const is2FAEnabled = false;

export enum Environment {
  // Internal Environments
  DEV = 'DEV',
  SANDBOX = 'SANDBOX',
  BETA = 'BETA',
  PROD = 'PROD',
  // Customer-Facing Environments
  // NOTE: these resolve to the corresponding internal environments for convenience
  DEVELOPMENT = 'BETA',
  PRODUCTION = 'PROD',
}

export interface Ctx {
  env: Environment;
  apiKey?: string;
  capsuleClient: Client;
  disableWorkers?: boolean;
  offloadMPCComputationURL?: string;
  mpcComputationClient?: AxiosInstance;
  useLocalFiles?: boolean;
  useDKLS?: boolean;
  disableWebSockets: boolean;
  wasmOverride?: ArrayBuffer;
  cosmosPrefix?: string;
}

export enum OAuthMethod {
  GOOGLE = 'GOOGLE',
  TWITTER = 'TWITTER',
  APPLE = 'APPLE',
  DISCORD = 'DISCORD',
  FACEBOOK = 'FACEBOOK',
  FARCASTER = 'FARCASTER',
}

export type NetworkProp = keyof typeof Network | Network;

export type WalletTypeProp = keyof typeof WalletType | WalletType;

export const WalletSchemeMap = {
  DKLS: WalletScheme.DKLS,
  CGGMP: WalletScheme.CGGMP,
  ED25519: WalletScheme.ED25519,
};

export type WalletSchemeProp = keyof typeof WalletScheme | WalletScheme;

export type WalletFilters = {
  type?: WalletTypeProp[];
  scheme?: WalletSchemeProp[];
  forbidPregen?: boolean;
};

export const SupportedOnRamps: Partial<
  Record<Network, Partial<Record<OnRampAsset, Partial<Record<OnRampProvider, boolean>>>>>
> = {
  [Network.ETHEREUM]: {
    [OnRampAsset.ETHEREUM]: {
      [OnRampProvider.RAMP]: true,
      [OnRampProvider.STRIPE]: true,
    },
    [OnRampAsset.USDC]: {
      [OnRampProvider.RAMP]: true,
      [OnRampProvider.STRIPE]: true,
    },
  },
  [Network.ARBITRUM]: {
    [OnRampAsset.ETHEREUM]: {
      [OnRampProvider.RAMP]: true,
    },
    [OnRampAsset.USDC]: {
      [OnRampProvider.RAMP]: true,
    },
  },
  [Network.BASE]: {
    [OnRampAsset.ETHEREUM]: {
      [OnRampProvider.RAMP]: true,
    },
    [OnRampAsset.USDC]: {
      [OnRampProvider.RAMP]: true,
    },
  },
  [Network.OPTIMISM]: {
    [OnRampAsset.ETHEREUM]: {
      [OnRampProvider.RAMP]: true,
    },
    [OnRampAsset.USDC]: {
      [OnRampProvider.RAMP]: true,
    },
  },
  [Network.POLYGON]: {
    [OnRampAsset.POLYGON]: {
      [OnRampProvider.RAMP]: true,
      [OnRampProvider.STRIPE]: true,
    },
    [OnRampAsset.USDC]: {
      [OnRampProvider.RAMP]: true,
      [OnRampProvider.STRIPE]: true,
    },
  },
};

export type OnRampProviderProp = keyof typeof OnRampProvider | OnRampProvider;

export type RampConfig = {
  id: OnRampProviderProp;
  hostApiKey: string;
};

export type StripeConfig = {
  id: OnRampProviderProp;
};

export type OnRampAssetProp = keyof typeof OnRampAsset | OnRampAsset;

export type OnRampConfigProvider = RampConfig | StripeConfig;

export enum EnabledFlow {
  BUY = 'BUY',
  RECEIVE = 'RECEIVE',
}

export type EnabledFlowProp = keyof typeof EnabledFlow | EnabledFlow;

export type OnRampConfig = {
  /*
   * If true, uses testnet chains for any funds purchased and allows provider-specific test payment methods
   */
  testMode?: boolean;
  /*
   * The on-chain asset to be purchased, passed to the chosen providers. Must be supported by the current user wallet.
   */
  asset: OnRampAssetProp;
  /*
   * The network on which to purchase the chosen asset. One of `['ETHEREUM', 'ARBITRUM', 'BASE', 'OPTIMISM', 'POLYGON']`. If the
   * network and asset combination does not exist or is not supported by your chosen providers, modal instantiation will fail.
   * Defaults to 'ETHEREUM'
   */
  network: NetworkProp;
  enabledFlows?: EnabledFlowProp[];
  /*
   * Array of objects in the form `{id: 'STRIPE' | 'RAMP'}`. If using `RAMP`, you must also provide your API key: `{ id: 'RAMP', hostApiKey: '...' }`
   */
  providers: OnRampConfigProvider[];
};

export const OnRampProviderNetworkMap = {
  [OnRampProvider.RAMP]: {
    [Network.ETHEREUM]: 'ETH',
    [Network.ARBITRUM]: 'ARBITRUM',
    [Network.BASE]: 'BASE',
    [Network.OPTIMISM]: 'OPTIMISM',
    [Network.POLYGON]: 'MATIC',
  },
  [OnRampProvider.STRIPE]: {
    [Network.ETHEREUM]: 'ethereum',
    [Network.POLYGON]: 'polygon',
  },
};

export const OnRampProviderAssetMap = {
  [OnRampProvider.RAMP]: {
    [OnRampAsset.ETHEREUM]: 'ETH',
    [OnRampAsset.USDC]: 'USDC',
    [OnRampAsset.POLYGON]: 'MATIC',
  },
  [OnRampProvider.STRIPE]: {
    [OnRampAsset.ETHEREUM]: 'eth',
    [OnRampAsset.USDC]: 'usdc',
    [OnRampAsset.POLYGON]: 'matic',
  },
};

export enum OnRampMethod {
  ACH = 'ACH',
  DEBIT = 'Debit',
  CREDIT = 'Credit',
  APPLE_PAY = 'Apple Pay',
}

export const WalletSchemeTypeMap: Record<WalletScheme, Partial<Record<WalletType, true>>> = {
  [WalletScheme.DKLS]: {
    [WalletType.EVM]: true,
    [WalletType.COSMOS]: true,
  },
  [WalletScheme.CGGMP]: {
    [WalletType.EVM]: true,
    [WalletType.COSMOS]: true,
  },
  [WalletScheme.ED25519]: {
    [WalletType.SOLANA]: true,
  },
};

export const getProviderNetworkAndAssetCode = (
  networkProp: NetworkProp,
  assetProp: OnRampAssetProp,
  providerProp: OnRampProviderProp,
  testMode = false,
): [string, string?] => {
  const [network, asset, provider] = [Network[networkProp], OnRampAsset[assetProp], OnRampProvider[providerProp]];
  if (!SupportedOnRamps[network][asset][provider]) {
    throw new Error(`Provider ${provider} does not support asset ${asset} on ${network}`);
  }

  switch (provider) {
    case OnRampProvider.RAMP:
      if (testMode) {
        return ['SEPOLIA_ETH'];
      }

      return [`${OnRampProviderNetworkMap[provider][network]}_${OnRampProviderAssetMap[provider][asset]}`];
    default:
      return [OnRampProviderNetworkMap[provider][network], OnRampProviderAssetMap[provider][asset]];
  }
};

export function getProviderAssetInverse(provider: OnRampProviderProp, asset: string): OnRampAsset {
  const match = Object.entries(OnRampProviderAssetMap[OnRampProvider[provider]]).find(
    ([, theirAssetCode]) => asset === theirAssetCode,
  );

  return match ? (match[0] as OnRampAsset) : undefined;
}

export function getPortalDomain(env: Environment) {
  switch (env) {
    case Environment.DEV:
      return 'localhost';
    case Environment.SANDBOX:
      return 'app.sandbox.usecapsule.com';
    case Environment.BETA:
      return 'app.beta.usecapsule.com';
    case Environment.PROD:
      return 'app.usecapsule.com';
    default:
      throw new Error(`env: ${env} not supported`);
  }
}

export function getPortalBaseURL({ env }: { env: Environment }, useLocalIp?: boolean) {
  const domain = getPortalDomain(env);
  if (env === Environment.DEV) {
    if (useLocalIp) {
      return `http://127.0.0.1:3003`;
    }
    return `http://${domain}:3003`;
  }
  return `https://${domain}`;
}

export const EXTERNAL_WALLET_CHANGE_EVENT = 'capsuleExternalWalletChange';
export const CURRENT_WALLET_IDS_CHANGE_EVENT = 'capsuleCurrentWalletIdsChange';
