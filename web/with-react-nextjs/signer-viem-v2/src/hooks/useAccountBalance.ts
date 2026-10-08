import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatEther, isAddress } from "viem";
import { publicClient } from "@/lib/publicClient";

export function useAccountBalance(address: string) {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["account-balance", address],
    queryFn: async () => {
      if (!isAddress(address)) {
        throw new Error("Invalid account address.");
      }

      return formatEther(await publicClient.getBalance({ address }));
    },
    enabled: Boolean(address),
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    balance: data ?? null,
    isLoading,
    isRefreshing: isFetching && !isLoading,
    refresh,
  };
}
