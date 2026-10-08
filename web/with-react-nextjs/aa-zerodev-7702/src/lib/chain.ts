import { sepolia } from "viem/chains";

export const SEPOLIA = {
  chain: sepolia,
  name: "Sepolia",
  networkLabel: "Sepolia testnet",
  currencySymbol: "ETH",
  explorerName: "Etherscan",
} as const;

export function explorerTxUrl(hash: string) {
  return `${sepolia.blockExplorers.default.url}/tx/${hash}`;
}
