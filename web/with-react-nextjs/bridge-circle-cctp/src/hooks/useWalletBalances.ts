import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAddress } from "viem";
import { readWalletBalances } from "@/lib/balances";
import { summarizeErrorMessage } from "@/lib/errorSummary";

export function useWalletBalances(address: string) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["wallet-balances", address],
    queryFn: () => {
      if (!isAddress(address)) {
        throw new Error("Invalid wallet address.");
      }

      return readWalletBalances(address);
    },
    enabled: Boolean(address),
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    balances: data ?? null,
    isLoading,
    isRefreshing: isFetching && !isLoading,
    errorMessage: summarizeErrorMessage(error?.message),
    refresh,
  };
}
