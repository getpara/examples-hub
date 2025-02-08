import { Network, OnRampAsset, WalletType } from '@getpara/user-management-client';
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
