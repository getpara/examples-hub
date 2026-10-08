export const SUI_TESTNET = {
  name: "Sui Testnet",
  network: "testnet",
  currencySymbol: "SUI",
  rpcUrl: "https://fullnode.testnet.sui.io:443",
  explorerName: "Suiscan",
  explorerUrl: "https://suiscan.xyz/testnet",
} as const;

export function explorerTxUrl(digest: string) {
  return `${SUI_TESTNET.explorerUrl}/tx/${digest}`;
}
