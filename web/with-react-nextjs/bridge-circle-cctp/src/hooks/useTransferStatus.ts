import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Hash } from "viem";
import { fetchTransferStatus, type TransferLookup } from "@/lib/transferStatus";
import { summarizeErrorMessage } from "@/lib/errorSummary";

const MINT_POLL_INTERVAL_MS = 10_000;

interface TransferStatusOptions {
  pollUntilMinted?: boolean;
}

function isMintedLookup(lookup: TransferLookup | undefined) {
  return Boolean(lookup?.isFound && lookup.transfer.isMinted);
}

export function useTransferStatus(burnTxHash: Hash | null, { pollUntilMinted = false }: TransferStatusOptions = {}) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["transfer-status", burnTxHash],
    queryFn: () => {
      if (!burnTxHash) {
        throw new Error("Enter a burn transaction hash.");
      }

      return fetchTransferStatus(burnTxHash);
    },
    enabled: burnTxHash !== null,
    refetchInterval: (query) => (pollUntilMinted && !isMintedLookup(query.state.data) ? MINT_POLL_INTERVAL_MS : false),
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    lookup: burnTxHash ? (data ?? null) : null,
    isLoading: burnTxHash !== null && isLoading,
    isRefreshing: isFetching && !isLoading,
    errorMessage: summarizeErrorMessage(error?.message),
    refresh,
  };
}
