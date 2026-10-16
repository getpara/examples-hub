import type { FactRow } from "@/components/ui/Facts";
import type { TransferStepTone, TransferStepView } from "@/components/ui/TransferStepList";
import type { MintSigner } from "@/lib/bridgeKit";
import type { BridgeQuote } from "@/lib/bridgeQuote";
import type { TransferStep, TransferStepName, TransferStepState } from "@/lib/bridgeSteps";
import { ARC, BASE, explorerTxUrl } from "@/lib/chain";
import { shortenAddress } from "@/lib/format";
import { USDC } from "@/lib/tokens";
import type { TransferRecord } from "@/lib/transferRecord";
import type { TransferStatus } from "@/lib/transferStatus";

const STEP_TITLES: Record<TransferStepName, string> = {
  approve: "Approve",
  burn: "Burn",
  attestation: "Attestation",
  mint: "Mint",
};

const ACTIVE_LABELS: Record<TransferStepName, string> = {
  approve: "Signing",
  burn: "Signing",
  attestation: "Waiting",
  mint: "Signing",
};

const STATUS_LABELS: Record<Exclude<TransferStepState, "active">, string> = {
  waiting: "Waiting",
  done: "Done",
  skipped: "Not needed",
  failed: "Failed",
};

const TONES: Record<TransferStepState, TransferStepTone> = {
  waiting: "waiting",
  active: "active",
  done: "done",
  skipped: "done",
  failed: "failed",
};

const CIRCLE_STATUS_LABELS: Record<string, string> = {
  complete: "Attested",
  pending_confirmations: "Waiting for confirmations",
};

export const MINT_SIGNER_LABELS: Record<MintSigner, string> = {
  wallet: "Your Para wallet",
  forwarder: "Circle forwarder",
};

function stepDetail(step: TransferStep, mintSigner: MintSigner) {
  if (step.name === "attestation") {
    return "Circle signs the burn message";
  }

  if (step.name === "mint") {
    return step.isForwarded || mintSigner === "forwarder" ? `${ARC.name}, delivered by Circle` : `${ARC.name}, signed by your Para wallet`;
  }

  return step.name === "approve" ? `${BASE.name}, lets Circle burn USDC` : `${BASE.name}, burns USDC`;
}

function stepStatusLabel(step: TransferStep, mintSigner: MintSigner) {
  if (step.state !== "active") {
    return STATUS_LABELS[step.state];
  }

  return step.name === "mint" && mintSigner === "forwarder" ? "Delivering" : ACTIVE_LABELS[step.name];
}

function stepExplorer(step: TransferStep) {
  if (!step.txHash || step.name === "attestation") {
    return {};
  }

  const network = step.name === "mint" ? ARC : BASE;
  return { explorerHref: explorerTxUrl(network, step.txHash), explorerLabel: network.explorerName };
}

export function getStepViews(steps: TransferStep[], mintSigner: MintSigner): TransferStepView[] {
  return steps.map((step) => ({
    key: step.name,
    title: STEP_TITLES[step.name],
    detail: stepDetail(step, mintSigner),
    statusLabel: stepStatusLabel(step, mintSigner),
    tone: TONES[step.state],
    ...stepExplorer(step),
  }));
}

export function formatCircleStatus(status: string) {
  return CIRCLE_STATUS_LABELS[status] ?? status;
}

export function formatUsdcValue(amount: string) {
  return `${amount} ${USDC.symbol}`;
}

export function formatGasValue(amount: string, symbol: string) {
  return `${Number(amount).toLocaleString("en-US", { maximumSignificantDigits: 4 })} ${symbol}`;
}

function hashFact(label: string, value: string | null, testId?: string): FactRow {
  return value
    ? { label, value: shortenAddress(value), title: value, tone: "mono", testId }
    : { label, value: "Not available", tone: "muted", testId };
}

function fullHashFact(label: string, value: string | null, testId?: string): FactRow {
  return value ? { label, value, tone: "mono", testId } : { label, value: "Not available", tone: "muted", testId };
}

export function getQuoteRows(quote: BridgeQuote): FactRow[] {
  return [
    { label: "You receive", value: `About ${formatUsdcValue(quote.received)}`, tone: "data", testId: "bridge-quote-received" },
    { label: "Circle fee", value: formatUsdcValue(quote.protocolFee), tone: "data", testId: "bridge-quote-protocol-fee" },
    ...(quote.forwarderFee
      ? [{ label: "Forwarder fee", value: formatUsdcValue(quote.forwarderFee), tone: "data", testId: "bridge-quote-forwarder-fee" } satisfies FactRow]
      : []),
    { label: `${BASE.name} gas`, value: formatGasValue(quote.baseGas, BASE.currencySymbol), tone: "data", testId: "bridge-quote-base-gas" },
    ...(quote.arcGas
      ? [{ label: `${ARC.name} gas`, value: formatGasValue(quote.arcGas, ARC.currencySymbol), tone: "data", testId: "bridge-quote-arc-gas" } satisfies FactRow]
      : []),
    { label: "Mint signed by", value: MINT_SIGNER_LABELS[quote.mintSigner], testId: "bridge-quote-mint-signer" },
  ];
}

export function getRecordRows(record: TransferRecord, isStatusLoading: boolean): FactRow[] {
  const pendingLabel = isStatusLoading ? "Checking" : "Not available";

  return [
    { label: "Amount", value: formatUsdcValue(record.amount), tone: "data", testId: "transfer-record-amount" },
    hashFact("Burn tx", record.burnTxHash, "transfer-record-burn-tx"),
    hashFact("Mint tx", record.mintTxHash, "transfer-record-mint-tx"),
    { label: "Mint signed by", value: record.mintSignedBy, testId: "transfer-record-mint-signer" },
    { label: "Speed", value: record.transferSpeed },
    { label: "Circle status", value: record.circleStatus ? formatCircleStatus(record.circleStatus) : pendingLabel, testId: "transfer-record-circle-status" },
    record.nonce ? hashFact("Nonce", record.nonce, "transfer-record-nonce") : { label: "Nonce", value: pendingLabel, tone: "muted" },
    { label: "Minted on Arc", value: record.mintedOnArc === null ? pendingLabel : record.mintedOnArc ? "Yes" : "Not yet", testId: "transfer-record-minted" },
  ];
}

export function getLookupRows(transfer: TransferStatus): FactRow[] {
  return [
    { label: "Circle status", value: formatCircleStatus(transfer.circleStatus), testId: "transfer-lookup-status" },
    fullHashFact("Nonce", transfer.nonce, "transfer-lookup-nonce"),
    { label: "Amount", value: transfer.amount ? formatUsdcValue(transfer.amount) : "Not available", tone: "data", testId: "transfer-lookup-amount" },
    fullHashFact("Recipient", transfer.recipient, "transfer-lookup-recipient"),
    { label: "Minted on Arc", value: transfer.isMinted ? "Yes" : "Not yet", testId: "transfer-lookup-minted" },
    ...(transfer.forwardTxHash ? [fullHashFact("Circle mint tx", transfer.forwardTxHash, "transfer-lookup-forward-tx")] : []),
  ];
}
