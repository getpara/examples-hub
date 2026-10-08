import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useParaSigner } from "@/hooks/useParaSigner";

export function useAccountBalance() {
  const { signer, connection } = useParaSigner();
  const sender = signer?.sender ?? null;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["account-balance", sender?.toBase58()],
    queryFn: async () => {
      if (!sender) {
        return null;
      }

      const balanceLamports = await connection.getBalance(sender);
      return (balanceLamports / LAMPORTS_PER_SOL).toString();
    },
    enabled: Boolean(sender),
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
