import type { ResultField } from "@/components/ui/ResultPanel";
import type { HandleTableRow } from "@/components/ui/HandleTable";
import type { WalletResultRow } from "@/components/ui/WalletResultTable";
import { shortenAddress } from "@/lib/format";
import { HANDLE_TYPE_LABELS, type HandleEntry, type WalletResult } from "@/lib/pregenWalletApi";

interface BulkSummary {
  total: number;
  succeeded: number;
  failed: number;
}

interface BatchProgress {
  completed: number;
  total: number;
}

export function formatFileSize(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function toHandleTableRows(entries: HandleEntry[]): HandleTableRow[] {
  return entries.map((entry) => ({ handle: entry.handle, typeLabel: HANDLE_TYPE_LABELS[entry.type] }));
}

export function toWalletResultRows(results: WalletResult[], offset: number): WalletResultRow[] {
  return results.map((result, index) => ({
    key: `${offset + index}-${result.type}-${result.handle}`,
    handle: result.handle,
    typeLabel: HANDLE_TYPE_LABELS[result.type],
    walletAddress: result.walletAddress,
    walletAddressLabel: shortenAddress(result.walletAddress),
    status: result.status,
    errorMessage: result.status === "failed" ? result.errorMessage : undefined,
  }));
}

export function getProgressFields(progress: BatchProgress): ResultField[] {
  return [{ label: "Progress", value: `${progress.completed} of ${progress.total}`, testId: "bulk-progress-display" }];
}

export function getSummaryFields(summary: BulkSummary): ResultField[] {
  return [
    { label: "Created", value: String(summary.succeeded), testId: "bulk-success-count" },
    { label: "Failed", value: String(summary.failed), testId: "bulk-failed-count" },
    { label: "Total", value: String(summary.total), testId: "bulk-total-count" },
  ];
}

export function pluralizeWallets(count: number) {
  return count === 1 ? "1 wallet" : `${count} wallets`;
}
