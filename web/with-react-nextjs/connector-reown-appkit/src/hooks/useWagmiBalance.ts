import { useCallback } from "react";
import { formatUnits, isAddress } from "viem";
import { useBalance } from "wagmi";

export function useWagmiBalance(address: string) {
  const { data, isLoading, isFetching, refetch } = useBalance({
    address: isAddress(address) ? address : undefined,
  });

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  return {
    balance: data ? formatUnits(data.value, data.decimals) : null,
    symbol: data?.symbol ?? "",
    isLoading,
    isRefreshing: isFetching && !isLoading,
    refresh,
  };
}
