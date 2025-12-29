// Supported chains for Rhinestone global wallet
export const SUPPORTED_CHAINS = [1, 42161, 8453, 137, 10] as const;

// USDC contract addresses per chain
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum USDC
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
};

// Chain names for display
export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  42161: "Arbitrum",
  8453: "Base",
  137: "Polygon",
  10: "Optimism",
  1868: "Soneium",
};

// Get chain name with fallback
export function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
}
