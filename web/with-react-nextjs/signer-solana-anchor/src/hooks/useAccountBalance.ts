import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useSolanaConnection } from "@/hooks/useSolanaConnection";

export function useAccountBalance(address: string) {
  const { connection } = useSolanaConnection();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["account-balance", address],
    queryFn: async () => String((await connection.getBalance(new PublicKey(address))) / LAMPORTS_PER_SOL),
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
