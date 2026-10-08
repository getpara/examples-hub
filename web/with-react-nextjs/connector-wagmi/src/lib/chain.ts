const EXPLORER_URL = "https://sepolia.etherscan.io";

export const SEPOLIA = {
  name: "Sepolia",
  networkLabel: "Sepolia testnet",
  currencySymbol: "ETH",
  explorerName: "Etherscan",
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
} as const;

export function explorerTxUrl(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function explorerAddressUrl(address: string) {
  return `${EXPLORER_URL}/address/${address}`;
}
