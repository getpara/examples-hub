import type { EstimateResult } from "@circle-fin/bridge-kit";
import type { MintSigner } from "@/lib/bridgeKit";
import { NATIVE_DECIMALS, USDC, formatNative, formatUsdc, parseDecimal } from "@/lib/tokens";

export interface BridgeQuote {
  mintSigner: MintSigner;
  protocolFee: string;
  forwarderFee: string | null;
  baseGas: string;
  arcGas: string | null;
  received: string;
  isAmountCovered: boolean;
}

type FeeType = EstimateResult["fees"][number]["type"];

const BASE_GAS_STEPS = new Set(["Approve", "Burn"]);
const ARC_GAS_STEP = "Mint";

function sumFees(estimate: EstimateResult, types: FeeType[]) {
  return estimate.fees
    .filter((fee) => types.includes(fee.type))
    .reduce((total, fee) => total + (parseDecimal(fee.amount ?? "0", USDC.decimals) ?? BigInt(0)), BigInt(0));
}

function sumGas(estimate: EstimateResult, stepNames: Set<string>) {
  return estimate.gasFees
    .filter((gasFee) => stepNames.has(gasFee.name))
    .reduce((total, gasFee) => total + (parseDecimal(gasFee.fees?.fee ?? "0", NATIVE_DECIMALS) ?? BigInt(0)), BigInt(0));
}

export function summarizeEstimate(estimate: EstimateResult, amount: bigint, mintSigner: MintSigner): BridgeQuote {
  const protocolFee = sumFees(estimate, ["provider", "kit"]);
  const forwarderFee = sumFees(estimate, ["forwarder"]);
  const received = amount - protocolFee - forwarderFee;
  const hasArcGas = estimate.gasFees.some((gasFee) => gasFee.name === ARC_GAS_STEP);

  return {
    mintSigner,
    protocolFee: formatUsdc(protocolFee),
    forwarderFee: mintSigner === "forwarder" ? formatUsdc(forwarderFee) : null,
    baseGas: formatNative(sumGas(estimate, BASE_GAS_STEPS)),
    arcGas: hasArcGas ? formatNative(sumGas(estimate, new Set([ARC_GAS_STEP]))) : null,
    received: formatUsdc(received > BigInt(0) ? received : BigInt(0)),
    isAmountCovered: received > BigInt(0),
  };
}
