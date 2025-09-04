import {
  TNetwork,
  TOnRampAsset,
  OnRampProvider,
  OnRampPurchaseType,
  OnRampAssetInfoRow,
  OnRampAssetInfo,
  TWalletType,
} from '@getpara/user-management-client';

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
    allowed?: TNetwork[];
    assets?: TOnRampAsset[];
    providers?: OnRampProvider[];
    action?: OnRampPurchaseType;
  } = {},
): TNetwork[] {
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
    network?: TNetwork;
    allowed?: TOnRampAsset[];
    providers?: OnRampProvider[];
    action?: OnRampPurchaseType;
  } = {},
): TOnRampAsset[] {
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

export const NETWORK_PREFIXES: Partial<Record<TNetwork, string>> = {
  COSMOS: 'cosmos',
  NOBLE: 'noble',
};

export function getNetworkPrefix(network: TNetwork): string | undefined {
  return NETWORK_PREFIXES[network];
}
