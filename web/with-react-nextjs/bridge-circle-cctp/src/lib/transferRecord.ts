import { SPEED_DOWNGRADED_WARNING_CODE, type BridgeResult } from "@circle-fin/bridge-kit";
import { findStep, type TransferStep } from "@/lib/bridgeSteps";
import { ROUTE } from "@/lib/chain";
import { USDC, formatUsdc, parseDecimal } from "@/lib/tokens";
import type { TransferLookup } from "@/lib/transferStatus";

export type MintSignerLabel = "Para wallet" | "Circle forwarder";

export interface TransferRecord {
  amount: string;
  token: string;
  route: string;
  transferSpeed: "Fast" | "Standard";
  burnTxHash: string | null;
  mintTxHash: string | null;
  mintSignedBy: MintSignerLabel;
  circleStatus: string | null;
  nonce: string | null;
  mintedOnArc: boolean | null;
}

export function normalizeUsdcAmount(amount: string) {
  const parsed = parseDecimal(amount, USDC.decimals);
  return parsed === null ? amount : formatUsdc(parsed);
}

export function createTransferRecord(result: BridgeResult, steps: TransferStep[], lookup: TransferLookup | null): TransferRecord {
  const mintStep = findStep(steps, "mint");
  const isForwarded = Boolean(mintStep?.isForwarded || result.destination.useForwarder);
  const wasSlowed = Boolean(result.warnings?.some((warning) => warning.code === SPEED_DOWNGRADED_WARNING_CODE));
  const transfer = lookup?.isFound ? lookup.transfer : null;

  return {
    amount: normalizeUsdcAmount(result.amount),
    token: USDC.symbol,
    route: ROUTE.label,
    transferSpeed: wasSlowed ? "Standard" : "Fast",
    burnTxHash: findStep(steps, "burn")?.txHash ?? null,
    mintTxHash: mintStep?.txHash ?? transfer?.forwardTxHash ?? null,
    mintSignedBy: isForwarded ? "Circle forwarder" : "Para wallet",
    circleStatus: transfer?.circleStatus ?? null,
    nonce: transfer?.nonce ?? null,
    mintedOnArc: transfer ? transfer.isMinted : null,
  };
}

export function serializeTransferRecord(record: TransferRecord) {
  return JSON.stringify(record, null, 2);
}
