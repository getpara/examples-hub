import {
  TOnRampAsset,
  OnRampAssetInfo,
  OnRampProvider,
  TNetwork,
  OnRampPurchaseType,
  OnRampConfig,
  TWalletType,
} from '@getpara/user-management-client';
import { getOnRampNetworks, getOnRampAssets, toAssetInfoArray, ProviderAssetInfo } from '@getpara/core-sdk';

export function getCurrencyCode(
  { assetInfo }: OnRampConfig,
  { network, asset, provider }: { network: TNetwork; asset: TOnRampAsset; provider: OnRampProvider },
): string | undefined {
  return Object.values(assetInfo).reduce((acc, record) => ({ ...acc, ...record }), {})[network]?.[asset]?.[provider]?.[0];
}

export function getCurrencyCodes(
  { assetInfo, allowedAssets, defaultOnRampNetwork, defaultOnRampAsset }: OnRampConfig,
  {
    provider,
    purchaseType,
    walletType,
  }: { provider: OnRampProvider; purchaseType: OnRampPurchaseType; walletType: TWalletType },
): { currencyCodes: string[]; defaultCurrencyCode?: string } {
  let defaultCurrencyCode: string | undefined;

  const currencyCodes = getOnRampNetworks(assetInfo, {
    walletType,
    allowed: allowedAssets ? (Object.keys(allowedAssets) as TNetwork[]) : undefined,
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
): [TNetwork, TOnRampAsset] {
  const row = toAssetInfoArray(data).find(([_, __, ___, providers]) =>
    [code.toUpperCase(), code.toLowerCase()].includes(providers[provider][0]),
  );

  return [row?.[1], row?.[2]];
}

export const TestNetworks: { main: TNetwork; test: TNetwork }[] = [
  { main: 'ETHEREUM', test: 'SEPOLIA' },
  { main: 'SOLANA', test: 'SOLANA_DEVNET' },
];

export function getNetworkTestEquivalent(network: TNetwork): TNetwork | undefined {
  return TestNetworks.find(({ main }) => main === network)?.test;
}

export function getNetworkOrMainNetEquivalent(network: TNetwork, testMode?: boolean): TNetwork {
  return testMode ? (TestNetworks.find(({ test }) => test === network)?.main ?? network) : network;
}

export const NetworkChainIds: { chainId: string; network: TNetwork }[] = [
  { chainId: '11155111', network: 'SEPOLIA' },
  { chainId: '1', network: 'ETHEREUM' },
  { chainId: '137', network: 'POLYGON' },
  { chainId: '42220', network: 'CELO' },
  { chainId: '8453', network: 'BASE' },
  { chainId: '42161', network: 'ARBITRUM' },
  { chainId: '10', network: 'OPTIMISM' },
];

export function getChainId(network: TNetwork): string | undefined {
  return NetworkChainIds.find(({ network: n }) => n === network)?.chainId ?? undefined;
}

export function getNetworkFromChainId(chainId?: string | undefined): TNetwork | undefined {
  return chainId ? NetworkChainIds.find(({ chainId: c }) => c === chainId)?.network : undefined;
}

const ETH_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

export const NetworkAssetAddresses: { network: TNetwork; asset: TOnRampAsset; address: string }[] = [
  { network: 'ETHEREUM', asset: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  { network: 'POLYGON', asset: 'USDC', address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359' },
  { network: 'CELO', asset: 'USDC', address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C' },
  { network: 'BASE', asset: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  { network: 'ARBITRUM', asset: 'USDC', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
  { network: 'OPTIMISM', asset: 'USDC', address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85' },
  { network: 'SOLANA', asset: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { network: 'SOLANA_DEVNET', asset: 'USDC', address: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU' },
  { network: 'SEPOLIA', asset: 'USDC', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' },
  { network: 'SOLANA_DEVNET', asset: 'TETHER', address: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS' },
];

export function getAssetFromContractAddress(network: TNetwork, contractAddress: string): TOnRampAsset | undefined {
  if (contractAddress === ETH_CONTRACT_ADDRESS) {
    return 'USDC';
  }

  const checkNetworks = [network, getNetworkOrMainNetEquivalent(network) ?? undefined]
    .filter((n): n is TNetwork => !!n)
    .map(n => n);

  return NetworkAssetAddresses.find(
    row => checkNetworks.includes(row.network) && row.asset.toLowerCase() === contractAddress.toLowerCase(),
  )?.asset;
}

export function getContractAddressFromAsset(network: TNetwork, asset: TOnRampAsset): string | undefined {
  if (asset === 'USDC') {
    return ETH_CONTRACT_ADDRESS;
  }
  return NetworkAssetAddresses.find(row => row.network === network && row.asset === asset)?.address;
}

export * from './getDeviceLogo.js';
export * from './getDeviceModelName.js';
export * from './getBrowserName.js';
export * from './formatBiometricHints.js';
export * from './getExternalWalletDisplayName.js';
export * from './getExternalWalletIcon.js';
export * from './safeStyled.js';
