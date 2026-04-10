"use client";

import { useState, useEffect, useCallback } from "react";
import { useParaSigner } from "./useParaSigner";

export function useBalance() {
  const { address, server, isReady } = useParaSigner();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address || !server) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    try {
      const account = await server.loadAccount(address);
      const nativeBalance = account.balances.find(
        (b) => b.asset_type === "native"
      );
      setBalance(nativeBalance?.balance ?? "0");
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const resp = error as { response?: { status?: number } };
        if (resp.response?.status === 404) {
          setBalance("0");
          return;
        }
      }
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [address, server]);

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
