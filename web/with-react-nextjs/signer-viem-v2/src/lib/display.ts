import { HOLESKY } from "@/lib/chain";
import { formatBalance } from "@/lib/format";

const BYTECODE_PREVIEW_LENGTH = 128;

export function formatReading(amount: string | null, symbol: string, isLoading: boolean) {
  if (isLoading) {
    return "Loading";
  }

  return formatBalance(amount, symbol) ?? "Unavailable";
}

export function formatMintProgress(minted: string | null, limit: string | null, symbol: string, isLoading: boolean) {
  if (isLoading) {
    return "Loading";
  }

  if (minted === null || limit === null) {
    return "Unavailable";
  }

  return `${Number(minted).toLocaleString("en-US", { maximumFractionDigits: 4 })} of ${formatBalance(limit, symbol)}`;
}

export function formatUnixTimestamp(seconds: number) {
  return new Date(seconds * 1000).toLocaleString();
}

export function previewBytecode(bytecode: string) {
  if (bytecode.length <= BYTECODE_PREVIEW_LENGTH * 2) {
    return bytecode;
  }

  return `${bytecode.slice(0, BYTECODE_PREVIEW_LENGTH)}…${bytecode.slice(-BYTECODE_PREVIEW_LENGTH)}`;
}

export function transactionPendingMessage(hash: string | null) {
  return hash
    ? `Waiting for ${HOLESKY.name} to confirm the transaction.`
    : "Approve the request in the Para window.";
}
