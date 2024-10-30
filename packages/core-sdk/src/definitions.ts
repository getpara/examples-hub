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
  OnRampPurchaseType,
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
  isE2E?: boolean;
}

export enum OAuthMethod {
  GOOGLE = 'GOOGLE',
  TWITTER = 'TWITTER',
  APPLE = 'APPLE',
  DISCORD = 'DISCORD',
  FACEBOOK = 'FACEBOOK',
  FARCASTER = 'FARCASTER',
}

export type deprecated__NetworkProp = keyof typeof Network | Network;

export type WalletTypeProp = keyof typeof WalletType | WalletType;

export type WalletSchemeProp = keyof typeof WalletScheme | WalletScheme;

export type WalletFilters = {
  type?: WalletTypeProp[];
  scheme?: WalletSchemeProp[];
  forbidPregen?: boolean;
};
export type deprecated__OnRampProviderProp = keyof typeof OnRampProvider | OnRampProvider;

export type deprecated__RampConfig = {
  id: deprecated__OnRampProviderProp;
  hostApiKey: string;
};

export type deprecated__StripeConfig = {
  id: deprecated__OnRampProviderProp;
};

export type deprecated__OnRampAssetProp = keyof typeof OnRampAsset | OnRampAsset;

export type deprecated__OnRampConfigProvider = deprecated__RampConfig | deprecated__StripeConfig;

export enum EnabledFlow {
  BUY = 'BUY',
  RECEIVE = 'RECEIVE',
  WITHDRAW = 'WITHDRAW',
}

export type deprecated__EnabledFlowProp = keyof typeof EnabledFlow | EnabledFlow;

export type deprecated__OnRampConfig = {
  /*
   * If true, uses testnet chains for any funds purchased and allows provider-specific test payment methods
   */
  testMode?: boolean;
  /*
   * The on-chain asset to be purchased, passed to the chosen providers. Must be supported by the current user wallet.
   */
  asset: deprecated__OnRampAssetProp;
  /*
   * The network on which to purchase the chosen asset. One of `['ETHEREUM', 'ARBITRUM', 'BASE', 'OPTIMISM', 'POLYGON']`. If the
   * network and asset combination does not exist or is not supported by your chosen providers, modal instantiation will fail.
   * Defaults to 'ETHEREUM'
   */
  network: deprecated__NetworkProp;
  enabledFlows?: deprecated__EnabledFlowProp[];
  /*
   * Array of objects in the form `{id: 'STRIPE' | 'RAMP'}`. If using `RAMP`, you must also provide your API key: `{ id: 'RAMP', hostApiKey: '...' }`
   */
  providers: deprecated__OnRampConfigProvider[];
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

export function getPortalDomain(env: Environment, isE2E?: boolean) {
  if (isE2E) {
    return `localhost`;
  }
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

export function getPortalBaseURL(
  { env, isE2E }: { env: Environment; isE2E?: boolean },
  useLocalIp?: boolean,
  isForWasm?: boolean,
) {
  if (isE2E) {
    if (isForWasm) {
      return `https://app.sandbox.usecapsule.com`;
    }
    return `http://localhost:3003`;
  }
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

export type ProviderAssetInfo = [string, Partial<Record<OnRampPurchaseType, boolean>>];

export type OnRampAssetInfo = Record<
  WalletType,
  Partial<Record<Network, Partial<Record<OnRampAsset, Partial<Record<OnRampProvider, ProviderAssetInfo>>>>>>
>;

export type OnRampAssetInfoRow = [WalletType, Network, OnRampAsset, Partial<Record<OnRampProvider, ProviderAssetInfo>>];

export function toAssetInfoArray(data: OnRampAssetInfo): OnRampAssetInfoRow[] {
  const result = [];

  Object.keys(data).forEach(walletType => {
    const networks = data[walletType];

    Object.keys(networks).forEach(network => {
      const assets = networks[network];

      Object.keys(assets).forEach(asset => {
        const providerInfo = assets[asset];

        result.push([walletType, network, asset, providerInfo]);
      });
    });
  });

  return result;
}

export function getOnRampNetworks(
  data: OnRampAssetInfo,
  { walletType, allowed }: { walletType?: WalletType; allowed?: Network[] } = {},
): Network[] {
  return [
    ...new Set(
      toAssetInfoArray(data)
        .filter(([type, network]) => (!walletType || type === walletType) && (!allowed || allowed.includes(network)))
        .map(([_, network]) => network),
    ),
  ];
}

export function getOnRampAssets(
  data: OnRampAssetInfo,
  {
    walletType,
    network,
    allowed,
  }: {
    walletType?: WalletType;
    network?: Network;
    allowed?: OnRampAsset[];
  } = {},
): OnRampAsset[] {
  return [
    ...new Set(
      toAssetInfoArray(data)
        .filter(
          ([t, n, a]) =>
            (!walletType || t === walletType) &&
            (!network || n === network) &&
            (!Array.isArray(allowed) || allowed.includes(a)),
        )
        .map(([, , asset]) => asset),
    ),
  ];
}
