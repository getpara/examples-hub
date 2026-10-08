import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCosmosQueryClient } from "@/hooks/useCosmosQueryClient";
import { ICS_PROVIDER_TESTNET, fromMinimalDenom } from "@/lib/chain";

export function useAccountBalance(address: string) {
  const { queryClient } = useCosmosQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["account-balance", address],
    queryFn: async () => {
      if (!queryClient) {
        throw new Error("Query client not connected.");
      }

      const coin = await queryClient.bank.balance(address, ICS_PROVIDER_TESTNET.denom);
      return fromMinimalDenom(coin.amount);
    },
    enabled: Boolean(address && queryClient),
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
