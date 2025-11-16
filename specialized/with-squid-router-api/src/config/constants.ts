import { Environment } from "@getpara/react-sdk";

export const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

export const SQUID_INTEGRATOR_ID = process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID ?? "";

if (!SQUID_INTEGRATOR_ID) {
  throw new Error(
    "Squid integrator ID is not defined. Please set NEXT_PUBLIC_SQUID_INTEGRATOR_ID in your environment variables."
  );
}

export const SUPPORTED_NETWORKS = ["ethereum", "base", "solana"] as const;
export type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number];

type NetworkConfig = {
  name: string;
  icon: string;
  chainId: number | string;
  usdcContractAddress: string;
  rpcUrl: string;
  networkType: "mainnet" | "testnet" | "devnet";
  networkCategory: "evm" | "svm";
};

export const NETWORK_CONFIG: Record<SupportedNetwork, NetworkConfig> = {
  ethereum: {
    name: "Ethereum",
    icon: "/ethereum.png",
    chainId: 1,
    usdcContractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL ?? "https://ethereum-rpc.publicnode.com",
    networkType: "mainnet",
    networkCategory: "evm",
  },
  base: {
    name: "Base",
    icon: "/base.png",
    chainId: 8453,
    usdcContractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL ?? "https://base-rpc.publicnode.com",
    networkType: "mainnet",
    networkCategory: "evm",
  },
  solana: {
    name: "Solana",
    icon: "/solana.png",
    chainId: "solana-mainnet-beta",
    usdcContractAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://solana-rpc.publicnode.com",
    networkType: "mainnet",
    networkCategory: "svm",
  },
};

export const SUPPORTED_ASSETS = ["usdc"] as const;
export type SupportedAsset = (typeof SUPPORTED_ASSETS)[number];

export const ASSET_DETAILS: Record<
  SupportedAsset,
  {
    id: string;
    name: string;
    symbol: string;
    icon: string;
  }
> = {
  usdc: {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    icon: "/usdc.png",
  },
};