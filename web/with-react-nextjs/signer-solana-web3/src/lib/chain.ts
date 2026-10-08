export const SOLANA_DEVNET = {
  name: "Solana Devnet",
  networkLabel: "Solana Devnet",
  currencySymbol: "SOL",
  rpcUrl: process.env.NEXT_PUBLIC_DEVNET_RPC_URL || "https://api.devnet.solana.com/",
  explorerName: "Solscan",
  explorerUrl: "https://solscan.io",
  cluster: "devnet",
} as const;

export function explorerTxUrl(signature: string) {
  return `${SOLANA_DEVNET.explorerUrl}/tx/${signature}?cluster=${SOLANA_DEVNET.cluster}`;
}
