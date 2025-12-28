"use client";

import { useState, useCallback, useEffect } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useParaSigner } from "./useParaSigner";

export function useBalance() {
  const { signer, connection, address, isReady } = useParaSigner();

  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address || !connection || !signer?.sender) return;

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
  }, [address, connection, signer]);

  useEffect(() => {
    if (address && connection && signer) {
      fetchBalance();
    }
  }, [address, connection, signer, fetchBalance]);

  return {
    balance,
    isLoading,
    isReady,
    address,
    refetch: fetchBalance,
  };
}
