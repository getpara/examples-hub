import { useState, useCallback, useMemo } from "react";
import { WalletResult } from "./use-batch-processor";
import { HandleEntry } from "./use-csv-parser";

export function useBulkResults() {
  const [results, setResults] = useState<WalletResult[]>([]);

  const initializeResults = useCallback((handleEntries: HandleEntry[]): WalletResult[] => {
    const initialResults = handleEntries.map((entry) => ({
      handle: entry.handle,
      type: entry.type,
      walletAddress: "",
      status: "pending" as const,
      errorMessage: undefined,
    }));
    
    setResults(initialResults);
    return initialResults;
  }, []);

  const updateResults = useCallback((newResults: WalletResult[]) => {
    setResults(newResults);
  }, []);

  const updateBatchResults = useCallback((batchResults: WalletResult[], startIndex: number) => {
    setResults((prevResults) => {
      const updatedResults = [...prevResults];
      batchResults.forEach((result, index) => {
        const globalIndex = startIndex + index;
        if (globalIndex < updatedResults.length) {
          updatedResults[globalIndex] = result;
        }
      });
      return updatedResults;
    });
  }, []);

  const resetResults = useCallback(() => {
    setResults([]);
  }, []);

  const getFailedResults = useCallback((): WalletResult[] => {
    return results.filter((r) => r.status === "failed");
  }, [results]);

  const markFailedAsPending = useCallback(() => {
    setResults((prevResults) =>
      prevResults.map((result) => {
        if (result.status === "failed") {
          return {
            ...result,
            status: "pending" as const,
            errorMessage: undefined,
          };
        }
        return result;
      })
    );
  }, []);

  const updateResultByHandle = useCallback((handle: string, type: HandleEntry["type"], newResult: Partial<WalletResult>) => {
    setResults((prevResults) =>
      prevResults.map((result) => {
        if (result.handle === handle && result.type === type) {
          return { ...result, ...newResult };
        }
        return result;
      })
    );
  }, []);

  const summary = useMemo(() => {
    return {
      total: results.length,
      success: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "failed").length,
      pending: results.filter((r) => r.status === "pending").length,
    };
  }, [results]);

  return {
    results,
    summary,
    initializeResults,
    updateResults,
    updateBatchResults,
    resetResults,
    getFailedResults,
    markFailedAsPending,
    updateResultByHandle,
  };
}