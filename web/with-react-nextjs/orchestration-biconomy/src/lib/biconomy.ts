import { base } from "viem/chains";

// Chain configuration for Biconomy MEE
export const CHAIN = base;

// USDC contract on Base mainnet
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
export const USDC_DECIMALS = 6;

// Default transfer amount (0.1 USDC)
export const DEFAULT_TRANSFER_AMOUNT = 100_000n;

