"use client";

import { useState, useEffect, useCallback } from "react";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { useParaSigner } from "./useParaSigner";

export function useBalance() {
  const { address, client, isReady } = useParaSigner();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    try {
      const { balance: bal } = await client.getBalance({ owner: address });
      // bal.balance is the total in MIST; convert to SUI for display.
      setBalance((Number(bal.balance) / Number(MIST_PER_SUI)).toString());
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, client]);

  useEffect(() => {
    if (isReady) {
      fetchBalance();
    }
  }, [isReady, fetchBalance]);

  return {
    balance,
    isLoading,
    refetch: fetchBalance,
    isReady,
    address,
  };
}
