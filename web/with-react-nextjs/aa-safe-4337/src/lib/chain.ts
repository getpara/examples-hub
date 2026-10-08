import { sepolia } from "viem/chains";

export const SEPOLIA = {
  chain: sepolia,
  name: "Sepolia",
  networkLabel: "Sepolia testnet",
  currencySymbol: "ETH",
  explorerName: "Etherscan",
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com",
} as const;

export function explorerTxUrl(hash: string) {
  return `${sepolia.blockExplorers.default.url}/tx/${hash}`;
}
