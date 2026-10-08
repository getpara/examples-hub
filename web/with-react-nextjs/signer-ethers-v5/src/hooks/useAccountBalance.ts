import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useEthersProvider } from "@/hooks/useEthersProvider";

export function useAccountBalance(address: string) {
  const { provider } = useEthersProvider();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["account-balance", address],
    queryFn: async () => ethers.utils.formatEther(await provider.getBalance(address)),
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
