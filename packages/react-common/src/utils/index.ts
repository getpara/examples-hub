import {
  OnRampAsset,
  OnRampAssetInfo,
  OnRampProvider,
  Network,
  getOnRampNetworks,
  getOnRampAssets,
  OnRampPurchaseType,
  toAssetInfoArray,
  ProviderAssetInfo,
  OnRampConfig,
  WalletType,
} from '@getpara/web-sdk';

export function getCurrencyCodes(
  { assetInfo, allowedAssets, defaultOnRampNetwork, defaultOnRampAsset }: OnRampConfig,
  {
    provider,
    purchaseType,
    walletType,
  }: { provider: OnRampProvider; purchaseType: OnRampPurchaseType; walletType: WalletType },
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
          .filter((entry): entry is ProviderAssetInfo => !!entry && !!entry[1][purchaseType])
          .map(([code]) => code),
      ];
    }, [])
    .filter((code): code is string => !!code);

  return { currencyCodes, defaultCurrencyCode: defaultCurrencyCode || currencyCodes[0] };
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

const ETH_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

export const NetworkAssetAddresses: { network: Network; asset: OnRampAsset; address: string }[] = [
  { network: Network.ETHEREUM, asset: OnRampAsset.USDC, address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  { network: Network.POLYGON, asset: OnRampAsset.USDC, address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359' },
  { network: Network.CELO, asset: OnRampAsset.USDC, address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C' },
  { network: Network.BASE, asset: OnRampAsset.USDC, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  { network: Network.ARBITRUM, asset: OnRampAsset.USDC, address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
  { network: Network.OPTIMISM, asset: OnRampAsset.USDC, address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85' },
  { network: Network.SOLANA, asset: OnRampAsset.USDC, address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { network: Network.SEPOLIA, asset: OnRampAsset.USDC, address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' },
];

export function getAssetFromContractAddress(network: Network, contractAddress: string): OnRampAsset | undefined {
  if (contractAddress === ETH_CONTRACT_ADDRESS) {
    return OnRampAsset.ETHEREUM;
  }

  const checkNetworks = [network, getNetworkOrMainNetEquivalent(network) ?? undefined]
    .filter((n): n is Network => !!n)
    .map(n => Network[n]);

  return NetworkAssetAddresses.find(
    row => checkNetworks.includes(row.network) && row.asset.toLowerCase() === contractAddress.toLowerCase(),
  )?.asset;
}

export function getContractAddressFromAsset(network: Network, asset: OnRampAsset): string | undefined {
  if (asset === OnRampAsset.ETHEREUM) {
    return ETH_CONTRACT_ADDRESS;
  }
  return NetworkAssetAddresses.find(row => row.network === network && row.asset === asset)?.address;
}

export * from './offRampSend.js';
export * from './getDeviceLogo.js';
export * from './getDeviceModelName.js';
export * from './getBrowserName.js';
export * from './formatBiometricHints.js';
