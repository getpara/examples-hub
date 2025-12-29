"use client";

import { useState, useEffect, useCallback } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useParaSigner } from "./useParaSigner";

export function useBalance() {
  const { signer, connection, isReady, address } = useParaSigner();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!signer?.sender || !connection) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    try {
      const balanceLamports = await connection.getBalance(signer.sender);
      setBalance((balanceLamports / LAMPORTS_PER_SOL).toFixed(4));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [signer, connection]);

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
