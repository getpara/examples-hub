import { holesky } from "viem/chains";

export const HOLESKY = {
  chain: holesky,
  name: "Holesky",
  networkLabel: "Holesky testnet",
  currencySymbol: "ETH",
  chainId: 17000,
  rpcUrl: process.env.NEXT_PUBLIC_HOLESKY_RPC_URL || "https://ethereum-holesky-rpc.publicnode.com",
  explorerName: "Etherscan",
  explorerUrl: "https://holesky.etherscan.io",
} as const;

export function explorerTxUrl(hash: string) {
  return `${HOLESKY.explorerUrl}/tx/${hash}`;
}

export function explorerAddressUrl(address: string) {
  return `${HOLESKY.explorerUrl}/address/${address}`;
}
