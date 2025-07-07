import { Environment } from "@getpara/react-sdk";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

export const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

// For Para SANDBOX environment, use the devnet RPC
export const DEVNET_RPC_URL = process.env.NEXT_PUBLIC_DEVNET_RPC_URL || "https://api.devnet.solana.com";

// Solana constants
export const LAMPORTS_PER_SOL = BigInt(1000000000);
export const DEFAULT_COMMITMENT = "confirmed" as const;
export const TRANSACTION_TIMEOUT_MS = 30000; // 30 seconds
export const RETRY_DELAY_MS = 500;
export const MAX_RETRIES = 3;

// Fee estimation
export const ESTIMATED_TRANSFER_FEE = 5000; // lamports
export const ESTIMATED_CONFIRMATION_TIME_MS = 5000; // 5 seconds on devnet

// Validation
export const SOLANA_ADDRESS_LENGTH = 44; // Base58 encoded address length
export const MIN_SOL_AMOUNT = 0.000000001; // 1 lamport