export const SUPPORTED_CHAINS = [1, 42161, 8453, 137, 10] as const;

export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  42161: "Arbitrum",
  8453: "Base",
  137: "Polygon",
  10: "Optimism",
};

export const SUPPORTED_CHAIN_NAMES = SUPPORTED_CHAINS.map((chainId) => CHAIN_NAMES[chainId]);

export const NETWORK = {
  label: "Mainnet",
  summary: `${SUPPORTED_CHAINS.length} chains`,
} as const;
