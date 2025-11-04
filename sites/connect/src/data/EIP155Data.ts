/**
 * @desc Refference list of eip155 chains
 * @url https://chainlist.org
 */

/**
 * Types
 */
export type TEIP155Chain = keyof typeof EIP155_CHAINS;

import {
  base,
  mainnet,
  arbitrum,
  arbitrumNova,
  aurora,
  avalanche,
  celo,
  linea,
  palm,
  polygon,
  optimism,
  zksync,
  zora,
  basecampTestnet,
  berachain,
  goerli,
  palmTestnet,
  arbitrumSepolia,
  arbitrumGoerli,
  lineaGoerli,
  auroraTestnet,
  avalancheFuji,
  baseGoerli,
  polygonMumbai,
  optimismGoerli,
  optimismSepolia,
  celoAlfajores,
  sepolia,
  berachainBepolia,
  celoSepolia,
} from 'viem/chains';
import * as viemChains from 'viem/chains';

/**
 * Chains
 */
const allViemChains = Object.values(viemChains);

// Transform all viem chains to EIP155 format
const DEFAULT_CHAINS = allViemChains.reduce(
  (acc, chain) => {
    acc[`eip155:${chain.id}`] = {
      chainId: chain.id,
      name: chain.name,
      rpc: chain.rpcUrls.default.http[0],
      namespace: 'eip155',
    };
    return acc;
  },
  {} as Record<string, any>,
);

// Overwrite chains with logo
export const DETAILED_CHAINS = {
  'eip155:1': {
    chainId: mainnet.id,
    name: mainnet.name,
    logo: '/chain-logos/eip155-1.png',
    rgb: '99, 125, 234',
    rpc: mainnet.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:42161': {
    chainId: arbitrum.id,
    name: arbitrum.name,
    namespace: 'eip155',
    rpc: arbitrum.rpcUrls.default.http[0],
    logo: '/chain-logos/eip155-42161.png',
  },
  'eip155:42170': {
    chainId: arbitrumNova.id,
    name: arbitrumNova.name,
    namespace: 'eip155',
    rpc: arbitrumNova.rpcUrls.default.http[0],
    logo: '/chain-logos/eip155-42161.png',
  },
  'eip155:1313161554': {
    chainId: aurora.id,
    name: aurora.name,
    namespace: 'eip155',
    rpc: aurora.rpcUrls.default.http[0],
    logo: '/chain-logos/aurora.png',
  },
  'eip155:43114': {
    chainId: avalanche.id,
    name: avalanche.name,
    logo: '/chain-logos/eip155-43113.png',
    rgb: '232, 65, 66',
    rpc: avalanche.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:8453': {
    chainId: base.id,
    name: base.name,
    logo: '/chain-logos/base-logo-in-blue.png',
    namespace: 'eip155',
    rpc: base.rpcUrls.default.http[0],
  },
  'eip155:56': {
    chainId: 56,
    name: 'BNB Smart Chain',
    logo: '/chain-logos/BNB-logo.png',
    namespace: 'eip155',
    rpc: 'https://bnbsmartchain-mainnet.infura.io/v3/bfd976501e0b4c51b20153f9fc9b0efc',
  },
  'eip155:42220': {
    chainId: celo.id,
    name: celo.name,
    logo: '/chain-logos/celo-logo.png',
    rgb: '235, 0, 25',
    rpc: celo.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:59144': {
    chainId: linea.id,
    name: linea.name,
    logo: '/chain-logos/linea.png',
    rgb: '235, 0, 25',
    rpc: linea.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:11297108109': {
    chainId: palm.id,
    name: palm.name,
    logo: '/chain-logos/palm.png',
    namespace: 'eip155',
    rpc: palm.rpcUrls.default.http[0],
  },
  'eip155:137': {
    chainId: polygon.id,
    name: polygon.name,
    logo: '/chain-logos/eip155-137.png',
    rgb: '130, 71, 229',
    rpc: polygon.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:10': {
    chainId: optimism.id,
    name: optimism.name,
    logo: '/chain-logos/eip155-10.png',
    rgb: '235, 0, 25',
    rpc: optimism.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:324': {
    chainId: zksync.id,
    name: zksync.name,
    logo: '/chain-logos/eip155-324.svg',
    rgb: '242, 242, 242',
    rpc: zksync.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:7777777': {
    chainId: zora.id,
    name: zora.name,
    logo: '/chain-logos/zora-logo.png',
    rgb: '242, 242, 242',
    rpc: zora.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:123420001114': {
    chainId: basecampTestnet.id,
    name: basecampTestnet.name,
    logo: '/chain-logos/basecamp.svg',
    rpc: basecampTestnet.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:80094': {
    chainId: berachain.id,
    name: berachain.name,
    logo: '/chain-logos/berachain.svg',
    rpc: berachain.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:484': {
    chainId: 484,
    name: 'Camp',
    logo: '/chain-logos/basecamp.svg',
    rpc: 'https://rpc.camp.raas.gelato.cloud',
    namespace: 'eip155',
  },
  'eip155:5': {
    chainId: goerli.id,
    name: goerli.name,
    logo: '/chain-logos/eip155-1.png',
    rgb: '99, 125, 234',
    rpc: goerli.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:11297108099': {
    chainId: palmTestnet.id,
    name: palmTestnet.name,
    logo: '/chain-logos/palm.png',
    namespace: 'eip155',
    rpc: palmTestnet.rpcUrls.default.http[0],
  },
  'eip155:421614': {
    chainId: arbitrumSepolia.id,
    name: arbitrumSepolia.name,
    namespace: 'eip155',
    rpc: arbitrumSepolia.rpcUrls.default.http[0],
    logo: '/chain-logos/eip155-42161.png',
  },
  'eip155:421613': {
    chainId: arbitrumGoerli.id,
    name: arbitrumGoerli.name,
    namespace: 'eip155',
    rpc: arbitrumGoerli.rpcUrls.default.http[0],
    logo: '/chain-logos/eip155-42161.png',
  },
  'eip155:59140': {
    chainId: lineaGoerli.id,
    name: lineaGoerli.name,
    logo: '/chain-logos/linea.png',
    rgb: '235, 0, 25',
    rpc: lineaGoerli.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:1313161555': {
    chainId: auroraTestnet.id,
    name: auroraTestnet.name,
    namespace: 'eip155',
    rpc: auroraTestnet.rpcUrls.default.http[0],
    logo: '/chain-logos/aurora.png',
  },
  'eip155:97': {
    chainId: 97,
    name: 'BNB Smart Chain Testnet',
    logo: '/chain-logos/BNB-logo.png',
    namespace: 'eip155',
    rpc: 'https://bnbsmartchain-testnet.infura.io/v3/bfd976501e0b4c51b20153f9fc9b0efc',
  },
  'eip155:43113': {
    chainId: avalancheFuji.id,
    name: avalancheFuji.name,
    logo: '/chain-logos/eip155-43113.png',
    rgb: '232, 65, 66',
    rpc: avalancheFuji.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:84531': {
    chainId: baseGoerli.id,
    name: baseGoerli.name,
    logo: '/chain-logos/base-logo-in-blue.png',
    rgb: '235, 0, 25',
    rpc: baseGoerli.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:80001': {
    chainId: polygonMumbai.id,
    name: polygonMumbai.name,
    logo: '/chain-logos/eip155-137.png',
    rgb: '130, 71, 229',
    rpc: polygonMumbai.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:420': {
    chainId: optimismGoerli.id,
    name: optimismGoerli.name,
    logo: '/chain-logos/eip155-10.png',
    rgb: '235, 0, 25',
    rpc: optimismGoerli.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:11155420': {
    chainId: optimismSepolia.id,
    name: optimismSepolia.name,
    logo: '/chain-logos/eip155-10.png',
    rgb: '235, 0, 25',
    rpc: optimismSepolia.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:280': {
    chainId: 280,
    name: 'zkSync Era Testnet',
    logo: '/chain-logos/eip155-324.svg',
    rgb: '242, 242, 242',
    rpc: 'https://testnet.era.zksync.dev/',
    namespace: 'eip155',
  },
  'eip155:44787': {
    chainId: celoAlfajores.id,
    name: celoAlfajores.name,
    logo: '/chain-logos/celo-logo.png',
    rgb: '60, 203, 132',
    rpc: celoAlfajores.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:11155111': {
    chainId: sepolia.id,
    name: sepolia.name,
    logo: '/chain-logos/eip155-1.png',
    rgb: '99, 125, 234',
    rpc: sepolia.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:80069': {
    chainId: berachainBepolia.id,
    name: berachainBepolia.name,
    logo: '/chain-logos/berachain.svg',
    rpc: berachainBepolia.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
  'eip155:11142220': {
    chainId: celoSepolia.id,
    name: celoSepolia.name,
    logo: '/chain-logos/celo-logo.png',
    rgb: '60, 203, 132',
    rpc: celoSepolia.rpcUrls.default.http[0],
    namespace: 'eip155',
  },
};

export const EIP155_TEST_CHAINS = {};

export const EIP155_CHAINS = {
  ...DEFAULT_CHAINS,
  ...DETAILED_CHAINS,
};

/**
 * Methods
 */
export const EIP155_SIGNING_METHODS = {
  PERSONAL_SIGN: 'personal_sign',
  ETH_SIGN: 'eth_sign',
  ETH_SIGN_TRANSACTION: 'eth_signTransaction',
  ETH_SIGN_TYPED_DATA: 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
  ETH_SEND_RAW_TRANSACTION: 'eth_sendRawTransaction',
  ETH_SEND_TRANSACTION: 'eth_sendTransaction',
  WALLET_SWITCH_ETHEREUM_CHAIN: 'wallet_switchEthereumChain',
};
