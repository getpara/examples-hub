import { Network, OnRampAsset, OnRampProvider, OnRampPurchaseType, TWalletType } from '@getpara/user-management-client';
import { OnRampAssetInfoRow, OnRampAssetInfo } from '../types/index.js';

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
  {
    walletType,
    allowed,
    assets,
    providers,
    action,
  }: {
    walletType?: TWalletType;
    allowed?: Network[];
    assets?: OnRampAsset[];
    providers?: OnRampProvider[];
    action?: OnRampPurchaseType;
  } = {},
): Network[] {
  return [
    ...new Set(
      toAssetInfoArray(data)
        .filter(
          ([type, network, asset, providerInfo]) =>
            (!walletType || type === walletType) &&
            (!allowed || allowed.includes(network)) &&
            (!assets || assets.includes(asset)) &&
            (!providers ||
              providers.some(provider => providerInfo[provider]?.[1] && (!action || providerInfo[provider][1][action]))),
        )
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
    providers,
    action,
  }: {
    walletType?: TWalletType;
    network?: Network;
    allowed?: OnRampAsset[];
    providers?: OnRampProvider[];
    action?: OnRampPurchaseType;
  } = {},
): OnRampAsset[] {
  return [
    ...new Set(
      toAssetInfoArray(data)
        .filter(
          ([t, n, a, p]) =>
            (!walletType || t === walletType) &&
            (!network || n === network) &&
            (!Array.isArray(allowed) || allowed.includes(a)) &&
            (!providers || providers.some(provider => p[provider]?.[1] && (!action || p[provider][1][action]))),
        )
        .map(([, , asset]) => asset),
    ),
  ];
}

export const NETWORK_PREFIXES: Partial<Record<Network, string>> = {
  [Network.COSMOS]: 'cosmos',
  [Network.NOBLE]: 'noble',
};

export function getNetworkPrefix(network: Network): string | undefined {
  return NETWORK_PREFIXES[network];
}
