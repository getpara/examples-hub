import { Chain, Transport } from 'viem';
import {
  ParaCosmosProviderConfigNoWallets,
  ParaEvmProviderConfigNoWallets,
  ParaSolanaProviderConfigNoWallets,
} from '../types/externalWalletProviders.js';

export const EXTERNAL_WALLET_PACKAGE_BY_TYPE = {
  EVM: 'Wagmi',
  COSMOS: 'Graz',
  SOLANA: '@solana/wallet-adapter-react',
};

export const EVM_CONFIG_DEFAULT: Omit<
  ParaEvmProviderConfigNoWallets<readonly [Chain, ...Chain[]], Record<[Chain, ...Chain[]][number]['id'], Transport>>,
  'appName' | 'appDescription' | 'appUrl' | 'appIcon' | 'projectId'
> = {
  chains: [
    {
      id: 11155111,
      name: 'Sepolia',
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: ['https://rpc.sepolia.org'] } },
      blockExplorers: {
        default: {
          name: 'Etherscan',
          url: 'https://sepolia.etherscan.io',
          apiUrl: 'https://api-sepolia.etherscan.io/api',
        },
      },
      contracts: {
        multicall3: { address: '0xca11bde05977b3631167028862be2a173976ca11', blockCreated: 751532 },
        ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' },
        ensUniversalResolver: { address: '0xc8Af999e38273D658BE1b921b88A9Ddf005769cC', blockCreated: 5317080 },
      },
      testnet: true,
    },
  ],
};

export const COSMOS_CONFIG_DEFAULT: ParaCosmosProviderConfigNoWallets = {
  chains: [
    {
      chainId: 'theta-testnet-001',
      currencies: [{ coinDenom: 'atom', coinMinimalDenom: 'uatom', coinDecimals: 6 }],
      rest: 'https://cosmoshubt.lava.build',
      rpc: 'https://cosmoshubt.tendermintrpc.lava.build:443',
      bech32Config: {
        bech32PrefixAccAddr: 'cosmos',
        bech32PrefixAccPub: 'cosmospub',
        bech32PrefixValAddr: 'cosmosvaloper',
        bech32PrefixValPub: 'cosmosvaloperpub',
        bech32PrefixConsAddr: 'cosmosvalcons',
        bech32PrefixConsPub: 'cosmosvalconspub',
      },
      chainName: 'cosmoshubtestnet',
      feeCurrencies: [
        {
          coinDenom: 'atom',
          coinMinimalDenom: 'uatom',
          coinDecimals: 6,
          coinGeckoId: '',
          gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
        },
      ],
      stakeCurrency: { coinDenom: 'atom', coinMinimalDenom: 'uatom', coinDecimals: 6 },
      bip44: { coinType: 118 },
    },
  ],
  onSwitchChain: () => {},
  selectedChainId: 'theta-testnet-001',
};

export const SOLANA_CONFIG_DEFAULT: Omit<ParaSolanaProviderConfigNoWallets, 'appIdentity'> = {
  chain: 'devnet',
  endpoint: 'https://api.devnet.solana.com',
};
