import { Environment } from "@getpara/react-sdk";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  console.warn("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

// RPC URL for Solana mainnet
export const MAINNET_RPC_URL = process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://api.mainnet-beta.solana.com";