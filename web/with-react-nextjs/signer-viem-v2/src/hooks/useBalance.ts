"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "@getpara/react-sdk";
import { publicClient } from "@/lib/viem";
import type { Address } from "viem";

export interface UseBalanceResult {
  balance: bigint | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBalance(address?: Address): UseBalanceResult {
  const { embedded } = useAccount();
  const connectedAddress = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const targetAddress = address ?? connectedAddress;

  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!targetAddress) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bal = await publicClient.getBalance({ address: targetAddress });
      setBalance(bal);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch balance");
      setError(error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [targetAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
