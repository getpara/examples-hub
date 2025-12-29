"use client";

import { useState, useEffect, useCallback } from "react";
import { useCosmosQueryClient } from "./useCosmosQueryClient";
import { useParaSigner } from "./useParaSigner";
import { DEFAULT_CHAIN } from "@/config/chains";

export function useBalance() {
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { queryClient } = useCosmosQueryClient();
  const { address } = useParaSigner();

  const refetch = useCallback(async () => {
    if (!address || !queryClient) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balanceResponse = await queryClient.getBalance(
        address,
        DEFAULT_CHAIN.coinMinimalDenom
      );
      const atomBalance = balanceResponse
        ? Number(balanceResponse.amount) / Math.pow(10, DEFAULT_CHAIN.coinDecimals)
        : 0;
      setBalance(atomBalance.toFixed(6));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch balance"));
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, queryClient]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    balance,
    isLoading,
    error,
    refetch,
    address,
    denom: DEFAULT_CHAIN.coinDenom,
  };
}
