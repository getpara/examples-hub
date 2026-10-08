import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { NotFoundError } from "@stellar/stellar-sdk";
import { horizon } from "@/lib/horizon";

async function loadNativeBalance(address: string) {
  try {
    const account = await horizon.loadAccount(address);
    const nativeBalance = account.balances.find((balance) => balance.asset_type === "native");
    return { balance: nativeBalance?.balance ?? "0", isFunded: true };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { balance: "0", isFunded: false };
    }
    throw error;
  }
}

export function useAccountBalance(address: string) {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["account-balance", address],
    queryFn: () => loadNativeBalance(address),
    enabled: Boolean(address),
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    balance: data?.balance ?? null,
    isUnfunded: data?.isFunded === false,
    isLoading,
    isRefreshing: isFetching && !isLoading,
    refresh,
  };
}
