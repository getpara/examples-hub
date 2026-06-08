"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@getpara/react-sdk-lite";
import { useEthersProvider } from "./useEthersProvider";

export function useBalance() {
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: wallet } = useWallet();
  const { provider } = useEthersProvider();

  const refetch = useCallback(async () => {
    if (!wallet?.address || !provider) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balanceWei = await provider.getBalance(wallet.address);
      setBalance(ethers.formatEther(balanceWei));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch balance"));
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [wallet?.address, provider]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    balance,
    isLoading,
    error,
    refetch,
    address: wallet?.address,
  };
}
