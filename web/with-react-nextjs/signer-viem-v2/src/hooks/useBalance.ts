"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEther } from "viem";
import { publicClient } from "@/lib/viem";
import { useParaSigner } from "./useParaSigner";

export function useBalance() {
  const { address, isReady, isLoading: isSignerLoading } = useParaSigner();
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const refetch = useCallback(async () => {
    if (!address) {
      setBalance(null);
      return;
    }

    try {
      setIsFetching(true);
      setError(null);
      const balanceWei = await publicClient.getBalance({ address });
      setBalance(formatEther(balanceWei));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch balance"));
      setBalance(null);
    } finally {
      setIsFetching(false);
    }
  }, [address]);

  useEffect(() => {
    if (isReady) {
      void refetch();
    } else {
      setBalance(null);
    }
  }, [isReady, refetch]);

  return {
    balance,
    address,
    error,
    refetch,
    isLoading: isSignerLoading || isFetching,
  };
}
