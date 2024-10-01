import {
  OnRampAsset,
  OnRampAssetInfo,
  OnRampProvider,
  Network,
  getOnRampNetworks,
  getOnRampAssets,
  toAssetInfoArray,
  ProviderAssetInfo,
  OnRampConfig,
  WalletType,
} from '@usecapsule/web-sdk';

export function getCurrencyCodes(
  { assetInfo, allowedAssets, defaultOnRampNetwork, defaultOnRampAsset }: OnRampConfig,
  { provider, walletType }: { provider: OnRampProvider; walletType: WalletType },
): { currencyCodes: string[]; defaultCurrencyCode?: string } {
  let defaultCurrencyCode: string | undefined;

  const currencyCodes = getOnRampNetworks(assetInfo, {
    walletType,
    allowed: allowedAssets ? (Object.keys(allowedAssets) as Network[]) : undefined,
  })
    .sort((a, b) => (a === defaultOnRampNetwork ? -1 : b === defaultOnRampNetwork ? 1 : 0))
    .reduce((acc: (string | undefined)[], network) => {
      const allowed = Array.isArray(allowedAssets?.[network]) ? allowedAssets[network] : undefined;
      return [
        ...acc,
        ...getOnRampAssets(assetInfo, { walletType, network, allowed })
          .sort((a, b) => (a === defaultOnRampAsset ? -1 : b === defaultOnRampAsset ? 1 : 0))
          .map(asset => {
            if (network === defaultOnRampNetwork && asset === defaultOnRampAsset) {
              defaultCurrencyCode = assetInfo[walletType]?.[network]?.[asset]?.[provider][0];
            }

            return assetInfo[walletType]?.[network]?.[asset]?.[provider];
          })
          .filter((entry): entry is ProviderAssetInfo => !!entry)
          .map(([code]) => code),
      ];
    }, [])
    .filter((code): code is string => !!code);

  return { currencyCodes, defaultCurrencyCode };
}

export function reverseCurrencyLookup(
  data: OnRampAssetInfo,
  provider: OnRampProvider,
  code: string,
): [Network, OnRampAsset] {
  const row = toAssetInfoArray(data).find(([_, __, ___, providers]) =>
    [code.toUpperCase(), code.toLowerCase()].includes(providers[provider][0]),
  );

  return [row?.[1], row?.[2]];
}

export const TestNetworks: { main: Network; test: Network }[] = [{ main: Network.ETHEREUM, test: Network.SEPOLIA }];

export function getNetworkTestEquivalent(network: Network): Network | undefined {
  return TestNetworks.find(({ main }) => main === network)?.test;
}

export function getNetworkOrMainNetEquivalent(network: Network, testMode?: boolean): Network {
  return testMode ? (TestNetworks.find(({ test }) => test === network)?.main ?? network) : network;
}

export const NetworkChainIds: { chainId: string; network: Network }[] = [
  { chainId: '11155111', network: Network.SEPOLIA },
  { chainId: '1', network: Network.ETHEREUM },
  { chainId: '137', network: Network.POLYGON },
  { chainId: '42220', network: Network.CELO },
  { chainId: '8453', network: Network.BASE },
  { chainId: '42161', network: Network.ARBITRUM },
  { chainId: '10', network: Network.OPTIMISM },
];

export function getChainId(network: Network): string | undefined {
  return NetworkChainIds.find(({ network: n }) => n === network)?.chainId ?? undefined;
}

export function getNetworkFromChainId(chainId?: string | undefined): Network | undefined {
  return chainId ? NetworkChainIds.find(({ chainId: c }) => c === chainId)?.network : undefined;
}
