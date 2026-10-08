import { sepolia } from "viem/chains";

export const SEPOLIA = {
  chain: sepolia,
  name: "Sepolia",
  networkLabel: "Sepolia testnet",
  currencySymbol: "ETH",
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com",
} as const;
