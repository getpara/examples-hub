export const SEPOLIA = {
  name: "Sepolia",
  networkLabel: "Sepolia testnet",
  currencySymbol: "ETH",
  chainId: 11155111,
  rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
  explorerName: "Etherscan",
  explorerUrl: "https://sepolia.etherscan.io",
} as const;

export function explorerTxUrl(hash: string) {
  return `${SEPOLIA.explorerUrl}/tx/${hash}`;
}
