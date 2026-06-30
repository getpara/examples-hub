"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useEthersProvider } from "@/hooks/useEthersProvider";

function formatEthBalance(balanceWei: bigint | null): string {
  if (balanceWei === null) return "--";
  if (balanceWei === BigInt(0)) return "0";

  const formatted = ethers.formatEther(balanceWei);
  const [whole, fraction = ""] = formatted.split(".");
  const trimmedFraction = fraction.slice(0, 6).replace(/0+$/, "");

  if (!trimmedFraction && whole === "0") return "<0.000001";
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
}

export function useWalletBalance(address: string) {
  const { provider } = useEthersProvider();
  const [balanceWei, setBalanceWei] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) {
      setBalanceWei(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setBalanceWei(await provider.getBalance(address));
    } catch {
      setError("Unable to load Sepolia balance.");
    } finally {
      setIsLoading(false);
    }
  }, [address, provider]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    balanceWei,
    formattedBalance: formatEthBalance(balanceWei),
    hasBalance: balanceWei !== null && balanceWei > BigInt(0),
    isLoading,
    error,
    refresh,
  };
}
