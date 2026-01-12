"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@getpara/react-sdk";
import { USDC_ADDRESS, CHAIN } from "@/lib/biconomy";

const RPC_URL = CHAIN.rpcUrls.default.http[0];

export function useUsdcBalance() {
  const { data: wallet } = useWallet();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!wallet?.address) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [
            {
              to: USDC_ADDRESS,
              data: `0x70a08231000000000000000000000000${wallet.address.slice(2)}`,
            },
            "latest",
          ],
        }),
      });
      const data = await response.json();
      if (data.result) {
        setBalance(BigInt(data.result));
      }
    } catch (err) {
      console.error("Failed to fetch USDC balance:", err);
    } finally {
      setIsLoading(false);
    }
  }, [wallet?.address]);

  // Initial fetch and polling
  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    refetch: fetchBalance,
  };
}

