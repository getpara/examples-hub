export const SEPOLIA = {
  name: "Sepolia",
  networkLabel: "Sepolia testnet",
  currencySymbol: "ETH",
  explorerName: "Etherscan",
} as const;

export function explorerAddressUrl(address: string) {
  return `https://sepolia.etherscan.io/address/${address}`;
}
