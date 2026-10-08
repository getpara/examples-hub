export const SEPOLIA = {
  name: "Sepolia",
  networkLabel: "Sepolia testnet",
  explorerName: "Etherscan",
  currencySymbol: "ETH",
} as const;

export function explorerAddressUrl(address: string) {
  return `https://sepolia.etherscan.io/address/${address}`;
}
