import { defineChain } from "viem";
import { arc, base } from "viem/chains";

const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org";
const ARC_RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.mainnet.arc.io";
const ARC_EXPLORER_URL = "https://explorer.arc.io";

export const BASE = {
  chain: base,
  name: "Base",
  networkLabel: "Base mainnet",
  currencySymbol: "ETH",
  rpcUrl: BASE_RPC_URL,
  explorerName: "Basescan",
  explorerUrl: base.blockExplorers.default.url,
} as const;

export const ARC = {
  chain: defineChain({
    ...arc,
    rpcUrls: { default: { http: [ARC_RPC_URL] } },
    blockExplorers: { default: { name: "Arc Explorer", url: ARC_EXPLORER_URL } },
  }),
  name: "Arc",
  networkLabel: "Arc mainnet",
  currencySymbol: "USDC",
  rpcUrl: ARC_RPC_URL,
  explorerName: "Arc Explorer",
  explorerUrl: ARC_EXPLORER_URL,
} as const;

export const ROUTE = {
  label: `${BASE.name} to ${ARC.name}`,
  networkLabel: `${BASE.name} and ${ARC.name} mainnet`,
} as const;

interface ExplorerNetwork {
  explorerUrl: string;
}

export function explorerTxUrl(network: ExplorerNetwork, hash: string) {
  return `${network.explorerUrl}/tx/${hash}`;
}
