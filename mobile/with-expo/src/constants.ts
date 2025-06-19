import { Environment } from "@getpara/react-sdk";

export const PARA_API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const PARA_ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) ?? Environment.BETA;

if (!PARA_API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

export const SOLANA_DEVNET_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ?? "https://api.devnet.solana.com";
export const BASE_SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ?? "https://base-sepolia-rpc.publicnode.com";
export const ETHEREUM_SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";

export const SUPPORTED_NETWORKS = ["ethereum", "base", "solana"] as const;
export type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number];

export type NetworkConfig = {
  name: string;
  icon: string;
  chainId: number | string;
  usdtContractAddress: string;
};

export const NETWORK_CONFIG: Record<SupportedNetwork, NetworkConfig> = {
  ethereum: {
    name: "Ethereum",
    icon: "🔵",
    chainId: 11155111,
    usdtContractAddress: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
  },
  base: {
    name: "Base",
    icon: "🔷",
    chainId: 84531,
    usdtContractAddress: "0xd7e9C75C6C05FdE929cAc19bb887892de78819B7",
  },
  solana: {
    name: "Solana",
    icon: "🟣",
    chainId: "devnet",
    usdtContractAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  },
};

// Keep assets separate as requested
export const SUPPORTED_ASSETS = ["usdt"] as const;
export type SupportedAsset = (typeof SUPPORTED_ASSETS)[number];

export const ASSET_DETAILS: Record<
  SupportedAsset,
  {
    name: string;
    symbol: string;
    icon: string;
    color: string;
  }
> = {
  usdt: {
    name: "Tether",
    symbol: "USDT",
    icon: "₮",
    color: "bg-green-500",
  },
};
