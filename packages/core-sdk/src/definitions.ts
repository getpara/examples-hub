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

import Client from '@usecapsule/user-management-client';
import { AxiosInstance } from 'axios';

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
}

export enum OAuthMethod {
  GOOGLE = 'GOOGLE',
  TWITTER = 'TWITTER',
  APPLE = 'APPLE',
  DISCORD = 'DISCORD',
  FACEBOOK = 'FACEBOOK',
}

export enum OnRampPurchaseStatus {
  INITIATED = 'INITIATED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export enum OnRampProvider {
  STRIPE = 'STRIPE',
  RAMP = 'RAMP',
}

export const OnRampProviderMap = {
  STRIPE: OnRampProvider.STRIPE,
  stripe: OnRampProvider.STRIPE,
  RAMP: OnRampProvider.RAMP,
  ramp: OnRampProvider.RAMP,
};

export type OnRampProviderProp = keyof typeof OnRampProviderMap | OnRampProvider;

export type RampConfig = {
  id: OnRampProviderProp;
  hostApiKey: string;
};

export type StripeConfig = {
  id: OnRampProviderProp;
};

export enum OnRampAsset {
  ETHEREUM = 'ETHEREUM',
  USDC = 'USDC',
}

export const OnRampAssetMap = {
  eth: OnRampAsset.ETHEREUM,
  ETH: OnRampAsset.ETHEREUM,
  ethereum: OnRampAsset.ETHEREUM,
  ETHEREUM: OnRampAsset.ETHEREUM,
  // sol: OnRampAsset.SOLANA,
  // SOL: OnRampAsset.SOLANA,
  // solana: OnRampAsset.SOLANA,
  // SOLANA: OnRampAsset.SOLANA,
  usdc: OnRampAsset.USDC,
  USDC: OnRampAsset.USDC,
};

export type OnRampAssetProp = keyof typeof OnRampAssetMap | OnRampAsset;

export type OnRampConfigProvider = RampConfig | StripeConfig;

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
   * Array of objects in the form `{id: 'STRIPE' | 'RAMP'}`. If using `RAMP`, you must also provide your API key: `{ id: 'RAMP', hostApiKey: '...' }`
   */
  providers: OnRampConfigProvider[];
};

export const OnRampProviderAssetMap = [
  // Production mode
  {
    [OnRampProvider.STRIPE]: {
      [OnRampAsset.ETHEREUM]: 'eth',
      // [OnRampAsset.SOLANA]: 'sol',
      [OnRampAsset.USDC]: 'usdc',
    },
    [OnRampProvider.RAMP]: {
      [OnRampAsset.ETHEREUM]: 'ETH_ETH',
      // [OnRampAsset.SOLANA]: 'SOL_SOL',
      [OnRampAsset.USDC]: 'ETH_USDC',
    },
  },
  // Test mode
  {
    [OnRampProvider.STRIPE]: {
      [OnRampAsset.ETHEREUM]: 'eth',
      // [OnRampAsset.SOLANA]: 'sol',
      [OnRampAsset.USDC]: 'usdc',
    },
    [OnRampProvider.RAMP]: {
      [OnRampAsset.ETHEREUM]: 'SEPOLIA_ETH',
      [OnRampAsset.USDC]: 'SEPOLIA_USDC',
    },
  },
];

export interface OnRampPurchase {
  id: string;
  status: OnRampPurchaseStatus;
  provider: OnRampProvider;
  providerKey?: string;
  fiatCurrency?: string;
  fiatQuantity?: string;
  asset?: OnRampAsset;
  assetQuantity?: string;
}

export enum OnRampMethod {
  ACH = 'ACH',
  DEBIT = 'Debit',
  CREDIT = 'Credit',
  APPLE_PAY = 'Apple Pay',
}

export function getProvider(key: OnRampProviderProp): OnRampProvider {
  return OnRampProviderMap[key];
}

export function getAsset(key: OnRampAssetProp): OnRampAsset {
  return OnRampAssetMap[key];
}

export function getProviderAsset(provider: OnRampProviderProp, asset: OnRampAssetProp, testMode = false): string {
  return OnRampProviderAssetMap[Number(testMode)][getProvider(provider)][getAsset(asset)];
}

export function getProviderAssetInverse(provider: OnRampProviderProp, asset: string, testMode?: boolean): OnRampAsset {
  const match = Object.entries(OnRampProviderAssetMap[Number(testMode)][getProvider(provider)]).find(
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
