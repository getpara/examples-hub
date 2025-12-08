import { useState, useCallback } from "react";
import { HandleEntry } from "./use-csv-parser";

export type ProcessingStatus = "idle" | "processing" | "complete";

export type WalletResult = {
  handle: string;
  type: HandleEntry["type"];
  walletAddress: string;
  status: "success" | "failed" | "pending";
  errorMessage?: string;
};

interface ProcessingProgress {
  current: number;
  total: number;
}

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1000;

export function useBatchProcessor() {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState<ProcessingProgress>({ current: 0, total: 0 });

  const processCreateBatch = useCallback(async (batchHandles: HandleEntry[]): Promise<WalletResult[]> => {
    console.log(
      `Processing batch of ${batchHandles.length} handles:`,
      batchHandles.map((h) => h.handle)
    );

    // Create an array of promises, one for each API call in the batch
    const apiCallPromises = batchHandles.map(async (entry) => {
      try {
        const response = await fetch("/api/wallet/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            handle: entry.handle,
            type: entry.type,
          }),
        });

        // Handle HTTP errors
        if (!response.ok) {
          let errorMsg = `API request failed with status ${response.status}`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMsg = errorData.error;
            }
          } catch (parseError) {
            console.warn("Could not parse error response body:", parseError);
          }
          throw new Error(errorMsg);
        }

        // Parse the successful JSON response
        const data = await response.json();

        // Check the 'success' flag from the API response
        if (data.success && data.wallet?.address) {
          return {
            handle: entry.handle,
            type: entry.type,
            walletAddress: data.wallet.address,
            status: "success" as const,
          };
        } else {
          throw new Error(data.error || "API returned unsuccessful status or missing data");
        }
      } catch (error) {
        console.error(`Failed to process handle ${entry.handle} (${entry.type}):`, error);
        return {
          handle: entry.handle,
          type: entry.type,
          walletAddress: "",
          status: "failed" as const,
          errorMessage: error instanceof Error ? error.message : "An unknown client-side error occurred",
        };
      }
    });

    // Wait for all API calls in the current batch to complete (or fail)
    const results = await Promise.all(apiCallPromises);
    console.log(`Batch processing complete. Results:`, results);
    return results;
  }, []);

  const processBatches = useCallback(async (
    handleEntries: HandleEntry[],
    onBatchComplete?: (results: WalletResult[], batchIndex: number) => void
  ): Promise<WalletResult[]> => {
    setStatus("processing");
    setProgress({ current: 0, total: handleEntries.length });

    const allResults: WalletResult[] = [];

    for (let i = 0; i < handleEntries.length; i += BATCH_SIZE) {
      const batch = handleEntries.slice(i, i + BATCH_SIZE);
      const batchResults = await processCreateBatch(batch);
      
      allResults.push(...batchResults);
      
      const currentProgress = Math.min(i + BATCH_SIZE, handleEntries.length);
      setProgress({ current: currentProgress, total: handleEntries.length });

      if (onBatchComplete) {
        onBatchComplete(batchResults, Math.floor(i / BATCH_SIZE));
      }

      // Delay between batches (except for the last batch)
      if (i + BATCH_SIZE < handleEntries.length) {
        console.log(`Processed batch ${i / BATCH_SIZE + 1}, pausing briefly...`);
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    console.log("All batches processed.");
    setStatus("complete");
    return allResults;
  }, [processCreateBatch]);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress({ current: 0, total: 0 });
  }, []);

  return {
    status,
    progress,
    processBatches,
    reset,
  };
}