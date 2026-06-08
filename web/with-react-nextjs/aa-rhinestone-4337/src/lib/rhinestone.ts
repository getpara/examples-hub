export const SUPPORTED_CHAINS = [1, 42161, 8453, 137, 10] as const;

export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  8453: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
};

export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  42161: "Arbitrum",
  8453: "Base",
  137: "Polygon",
  10: "Optimism",
};

export const SUPPORTED_CHAIN_NAMES = SUPPORTED_CHAINS.map((chainId) => CHAIN_NAMES[chainId]);

export function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
}
