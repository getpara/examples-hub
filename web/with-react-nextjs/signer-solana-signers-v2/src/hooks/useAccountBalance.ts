import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParaSigner } from "@/hooks/useParaSigner";

const LAMPORTS_PER_SOL = 1_000_000_000;

export function useAccountBalance() {
  const { signer, rpc, isReady } = useParaSigner();
  const address = signer?.address ?? null;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["account-balance", address],
    queryFn: async () => {
      if (!address) {
        throw new Error("Signer not initialized.");
      }
      const response = await rpc.getBalance(address).send();
      return String(Number(response.value) / LAMPORTS_PER_SOL);
    },
    enabled: isReady && Boolean(address),
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
