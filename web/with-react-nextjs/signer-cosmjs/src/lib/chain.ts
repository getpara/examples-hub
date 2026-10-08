export const ICS_PROVIDER_TESTNET = {
  chainId: "provider",
  name: "ICS Provider Testnet",
  networkLabel: "ICS Provider Testnet",
  rpcUrl: "https://rpc.provider-sentry-01.ics-testnet.polypore.xyz",
  currencySymbol: "ATOM",
  denom: "uatom",
  decimals: 6,
  gasPrice: "0.025uatom",
  explorerUrl: "https://explorer.polypore.xyz/provider",
} as const;

export const IBC_TRANSFER = {
  port: "transfer",
  defaultChannel: "channel-0",
  timeoutMs: 60 * 60 * 1000,
} as const;

export function explorerTxUrl(hash: string) {
  return `${ICS_PROVIDER_TESTNET.explorerUrl}/tx/${hash}`;
}

export function toMinimalDenom(amount: string) {
  return Math.floor(parseFloat(amount) * 10 ** ICS_PROVIDER_TESTNET.decimals);
}

export function fromMinimalDenom(amount: string) {
  return String(Number(amount) / 10 ** ICS_PROVIDER_TESTNET.decimals);
}
