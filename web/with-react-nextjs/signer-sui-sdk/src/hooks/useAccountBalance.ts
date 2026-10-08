import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { suiClient } from "@/lib/suiClient";

export function useAccountBalance(address: string) {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["account-balance", address],
    queryFn: async () => {
      const { balance } = await suiClient.getBalance({ owner: address });
      return (Number(balance.balance) / Number(MIST_PER_SUI)).toString();
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
