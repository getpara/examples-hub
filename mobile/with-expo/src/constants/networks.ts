/**
 * Centralized network configurations, token symbols, and defaults
 */

// Network import removed as it's not used in this file

// Using string literals instead of Network enum to avoid type issues
// The actual Network enum values from Para SDK are not consistently exported
export const NETWORK_CONFIGS = {
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    explorer: 'https://etherscan.io',
    defaultGasLimit: 21_000,
    defaultPriorityFee: 2_000_000_000n, // 2 gwei
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    explorer: 'https://polygonscan.com',
    defaultGasLimit: 21_000,
    defaultPriorityFee: 30_000_000_000n, // 30 gwei
  },
  bnb: {
    name: 'BNB Chain',
    symbol: 'BNB',
    decimals: 18,
    explorer: 'https://bscscan.com',
    defaultGasLimit: 21_000,
    defaultPriorityFee: 3_000_000_000n, // 3 gwei
  },
  arbitrum: {
    name: 'Arbitrum',
    symbol: 'ETH',
    decimals: 18,
    explorer: 'https://arbiscan.io',
    defaultGasLimit: 21_000,
    defaultPriorityFee: 100_000_000n, // 0.1 gwei
  },
  optimism: {
    name: 'Optimism',
    symbol: 'ETH',
    decimals: 18,
    explorer: 'https://optimistic.etherscan.io',
    defaultGasLimit: 21_000,
    defaultPriorityFee: 1_000_000n, // 0.001 gwei
  },
  avalanche: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
    explorer: 'https://snowtrace.io',
    defaultGasLimit: 21_000,
    defaultPriorityFee: 25_000_000_000n, // 25 gwei
  },
  base: {
    name: 'Base',
    symbol: 'ETH',
    decimals: 18,
    explorer: 'https://basescan.org',
    defaultGasLimit: 21_000,
    defaultPriorityFee: 1_000_000n, // 0.001 gwei
  },
  solana: {
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    explorer: 'https://explorer.solana.com',
    defaultLamportsPerSignature: 5_000,
  },
} as const;

export const TOKEN_DECIMALS = {
  ETH: 18,
  MATIC: 18,
  BNB: 18,
  AVAX: 18,
  SOL: 9,
  USDC: 6,
  USDT: 6,
  DAI: 18,
} as const;

export const NATIVE_TOKEN_PLACEHOLDER =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const DEFAULT_FEE_OPTIONS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const TRANSACTION_LIMITS = {
  MAX_PAGES: 5,
  DEFAULT_PAGE_SIZE: 20,
  MAX_RETRIES: 3,
} as const;

export const RECIPIENT_PLACEHOLDERS = {
  ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f5b8E3',
  polygon: '0x742d35Cc6634C0532925a3b844Bc9e7595f5b8E3',
  bnb: '0x742d35Cc6634C0532925a3b844Bc9e7595f5b8E3',
  arbitrum: '0x742d35Cc6634C0532925a3b844Bc9e7595f5b8E3',
  optimism: '0x742d35Cc6634C0532925a3b844Bc9e7595f5b8E3',
  avalanche: '0x742d35Cc6634C0532925a3b844Bc9e7595f5b8E3',
  base: '0x742d35Cc6634C0532925a3b844Bc9e7595f5b8E3',
  solana: '11111111111111111111111111111111',
} as const;

type NetworkKey = keyof typeof NETWORK_CONFIGS;

/**
 * Get network configuration by network key
 */
export function getNetworkConfig(network: NetworkKey | string) {
  return NETWORK_CONFIGS[network as NetworkKey];
}

/**
 * Get native token symbol for a network
 */
export function getNativeTokenSymbol(network: NetworkKey | string): string {
  return NETWORK_CONFIGS[network as NetworkKey]?.symbol || 'ETH';
}

/**
 * Get network name for display
 */
export function getNetworkDisplayName(network: NetworkKey | string): string {
  return NETWORK_CONFIGS[network as NetworkKey]?.name || 'Unknown';
}
