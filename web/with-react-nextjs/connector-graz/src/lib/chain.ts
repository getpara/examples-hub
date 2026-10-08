const EXPLORER_URL = "https://testnet.ping.pub/cosmos";

export const ICS_PROVIDER_TESTNET = {
  chainId: "provider",
  chainName: "Cosmos ICS Provider Testnet",
  networkLabel: "ICS Provider Testnet",
  rpcUrl: "https://rpc.provider-sentry-01.ics-testnet.polypore.xyz",
  restUrl: "https://rest.provider-sentry-01.ics-testnet.polypore.xyz",
  currencySymbol: "ATOM",
  denom: "uatom",
  decimals: 6,
  explorerName: "Ping.pub",
  faucetUrl: "https://testnet.ping.pub/cosmos/faucet",
  faucetAddress: "cosmos1qdvzqujxqd0pqwcdtpxgfcqcvxn777ka3xmn4u",
} as const;

export function explorerTxUrl(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function explorerAddressUrl(address: string) {
  return `${EXPLORER_URL}/account/${address}`;
}
