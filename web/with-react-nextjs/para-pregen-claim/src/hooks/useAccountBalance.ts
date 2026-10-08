import { useCallback } from "react";
import { useWalletBalance } from "@getpara/react-sdk-lite";

export function useAccountBalance() {
  const { data, isLoading, isFetching, refetch } = useWalletBalance();

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    balance: data ?? null,
    isLoading,
    isRefreshing: isFetching && !isLoading,
    refresh,
  };
}
