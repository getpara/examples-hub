"use client";

import { useState, useCallback, useEffect } from "react";
import { useParaSigner } from "./useParaSigner";

const LAMPORTS_PER_SOL = BigInt(1000000000);

export function useBalance() {
  const { signer, rpc, isReady, address } = useParaSigner();

  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!signer || !rpc || !isReady) return;

    setIsLoading(true);
    try {
      const response = await rpc.getBalance(signer.address).send();
      setBalance((Number(response.value) / Number(LAMPORTS_PER_SOL)).toFixed(4));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [signer, rpc, isReady]);

  useEffect(() => {
    if (isReady) {
      fetchBalance();
    }
  }, [isReady, fetchBalance]);

  return {
    balance,
    isLoading,
    refetch: fetchBalance,
    address,
  };
}
