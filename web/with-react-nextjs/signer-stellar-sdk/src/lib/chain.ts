export const STELLAR_TESTNET = {
  name: "Stellar Testnet",
  networkLabel: "Stellar testnet",
  currencySymbol: "XLM",
  horizonUrl: "https://horizon-testnet.stellar.org",
  friendbotUrl: "https://friendbot.stellar.org",
  explorerName: "Stellar Expert",
  explorerUrl: "https://stellar.expert/explorer/testnet",
} as const;

export function explorerTxUrl(hash: string) {
  return `${STELLAR_TESTNET.explorerUrl}/tx/${hash}`;
}
