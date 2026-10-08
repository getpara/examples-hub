import { useCallback, useMemo, useState } from "react";
import type { GenerateWalletRequestBody, GenerateWalletResponse, HandleEntry, WalletResult } from "@/lib/pregenWalletApi";

export type BulkStage = "idle" | "processing" | "complete";

interface QueuedEntry {
  entry: HandleEntry;
  index: number;
}

interface BatchProgress {
  completed: number;
  total: number;
}

export const BATCH_SIZE = 5;
export const BATCH_DELAY_MS = 1000;

async function requestPregenWallet({ handle, type }: HandleEntry): Promise<WalletResult> {
  const entry: GenerateWalletRequestBody = { handle, type };

  try {
    const response = await fetch("/api/wallet/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    const data: GenerateWalletResponse = await response.json();

    if (!response.ok || !data.success || !data.wallet?.address) {
      throw new Error(data.error ?? `Request failed with status ${response.status}`);
    }

    return { ...entry, walletAddress: data.wallet.address, status: "success" };
  } catch (error) {
    return {
      ...entry,
      walletAddress: "",
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Failed to create the pregen wallet",
    };
  }
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function toPendingResult({ handle, type }: HandleEntry): WalletResult {
  return { handle, type, walletAddress: "", status: "pending" };
}

export function useBulkPregenWallets() {
  const [results, setResults] = useState<WalletResult[]>([]);
  const [progress, setProgress] = useState<BatchProgress>({ completed: 0, total: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const processQueue = useCallback(async (queue: QueuedEntry[]) => {
    setIsProcessing(true);
    setProgress({ completed: 0, total: queue.length });

    for (let start = 0; start < queue.length; start += BATCH_SIZE) {
      const batch = queue.slice(start, start + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(({ entry }) => requestPregenWallet(entry)));

      setResults((current) => {
        const next = [...current];
        batch.forEach(({ index }, batchIndex) => {
          next[index] = batchResults[batchIndex];
        });
        return next;
      });
      setProgress({ completed: Math.min(start + BATCH_SIZE, queue.length), total: queue.length });

      if (start + BATCH_SIZE < queue.length) {
        await wait(BATCH_DELAY_MS);
      }
    }

    setIsProcessing(false);
  }, []);

  const create = useCallback(
    async (entries: HandleEntry[]) => {
      if (entries.length === 0) {
        return;
      }

      setResults(entries.map(toPendingResult));
      await processQueue(entries.map((entry, index) => ({ entry, index })));
    },
    [processQueue]
  );

  const retryFailed = useCallback(async () => {
    const queue = results.flatMap((result, index) =>
      result.status === "failed" ? [{ entry: result, index }] : []
    );

    if (queue.length === 0) {
      return;
    }

    setResults((current) =>
      current.map((result) => (result.status === "failed" ? toPendingResult(result) : result))
    );
    await processQueue(queue);
  }, [processQueue, results]);

  const reset = useCallback(() => {
    setResults([]);
    setProgress({ completed: 0, total: 0 });
  }, []);

  const summary = useMemo(
    () => ({
      total: results.length,
      succeeded: results.filter((result) => result.status === "success").length,
      failed: results.filter((result) => result.status === "failed").length,
    }),
    [results]
  );

  const stage: BulkStage = isProcessing ? "processing" : results.length > 0 ? "complete" : "idle";

  return {
    stage,
    progress,
    results,
    summary,
    create,
    retryFailed,
    reset,
  };
}
