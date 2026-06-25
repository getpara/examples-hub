import { Environment } from "@getpara/react-sdk";
import { base, type Chain } from "viem/chains";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const ENVIRONMENT =
  (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  console.warn(
    "API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.",
  );
}

// Base mainnet. vaults.fyi indexes mainnet vaults only; there are no testnet
// equivalents for Morpho / Aave / Sky / Spark / etc. so the deposit cycle
// requires real USDC on Base. The deposit flow in this recipe defaults to
// 1 USDC, which is enough to runtime-test the integration end-to-end for ~$1.
export const BASE_CHAIN: Chain = base;
export const BASE_RPC_URL =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ?? "https://mainnet.base.org";

// vaults.fyi network identifier (string the API expects in paths / filters).
export const VAULTSFYI_NETWORK = "base";
