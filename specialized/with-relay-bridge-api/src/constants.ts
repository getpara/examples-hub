import { Environment } from "@getpara/react-sdk";

export const PARA_API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
export const PARA_ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!PARA_API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

export const SUPPORTED_NETWORKS = ["ethereum", "base", "solana"] as const;
export type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number];

type NetworkConfig = {
  name: string;
  icon: string;
  chainId: number;
  usdcContractAddress: string;
  rpcUrl: string;
  networkType: "mainnet" | "testnet" | "devnet";
  networkCategory: "evm" | "svm";
};

export const NETWORK_CONFIG: Record<SupportedNetwork, NetworkConfig> = {
  ethereum: {
    name: "Ethereum",
    icon: "/ethereum.png",
    chainId: 11155111,
    usdcContractAddress: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com",
    networkType: "testnet",
    networkCategory: "evm",
  },
  base: {
    name: "Base",
    icon: "/base.png",
    chainId: 84532,
    usdcContractAddress: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ?? "https://base-sepolia-rpc.publicnode.com",
    networkType: "testnet",
    networkCategory: "evm",
  },
  solana: {
    name: "Solana",
    icon: "/solana.png",
    chainId: 1936682084,
    usdcContractAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL ?? "https://api.devnet.solana.com",
    networkType: "devnet",
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
