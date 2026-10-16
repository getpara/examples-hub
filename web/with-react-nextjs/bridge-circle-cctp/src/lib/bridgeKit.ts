import { BridgeKit, type BridgeResult, type EstimateResult } from "@circle-fin/bridge-kit";
import type { BridgeAdapter } from "@/lib/bridgeAdapter";
import { USDC, parseDecimal } from "@/lib/tokens";

export type MintSigner = "wallet" | "forwarder";

export const MINT_GAS_RESERVE = parseDecimal("0.01", USDC.decimals) ?? BigInt(0);

const bridgeKit = new BridgeKit();

export type BridgeEvent = Parameters<Parameters<typeof bridgeKit.on>[1]>[0];

type BridgeEventHandler = (event: BridgeEvent) => void;

export function selectMintSigner(arcUsdcBalance: bigint): MintSigner {
  return arcUsdcBalance >= MINT_GAS_RESERVE ? "wallet" : "forwarder";
}

function createBridgeParams(adapter: BridgeAdapter, amount: string, mintSigner: MintSigner) {
  return {
    from: { adapter, chain: "Base" as const },
    to: { adapter, chain: "Arc" as const, useForwarder: mintSigner === "forwarder" },
    amount,
    config: { transferSpeed: "FAST" as const, batchTransactions: false },
  };
}

export function estimateBridge(adapter: BridgeAdapter, amount: string, mintSigner: MintSigner): Promise<EstimateResult> {
  return bridgeKit.estimate(createBridgeParams(adapter, amount, mintSigner));
}

async function withBridgeEvents(onEvent: BridgeEventHandler, run: () => Promise<BridgeResult>) {
  bridgeKit.on("*", onEvent);

  try {
    return await run();
  } finally {
    bridgeKit.off("*", onEvent);
  }
}

export function runBridge(adapter: BridgeAdapter, amount: string, mintSigner: MintSigner, onEvent: BridgeEventHandler) {
  return withBridgeEvents(onEvent, () => bridgeKit.bridge(createBridgeParams(adapter, amount, mintSigner)));
}

export function retryBridge(adapter: BridgeAdapter, failedResult: BridgeResult, onEvent: BridgeEventHandler) {
  return withBridgeEvents(onEvent, () => bridgeKit.retry(failedResult, { from: adapter, to: adapter }));
}
