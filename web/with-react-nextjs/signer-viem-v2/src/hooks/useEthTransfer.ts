"use client";

import { useState } from "react";
import { isAddress, parseEther, type Hex } from "viem";
import { CHAIN, publicClient } from "@/lib/viem";
import { useParaSigner } from "./useParaSigner";

export function useEthTransfer() {
  const { viemClient, account, isReady } = useParaSigner();
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setTxHash(null);
    setError(null);
  };

  const sendTransaction = async (to: string, amount: string) => {
    if (!viemClient || !account) {
      setError(new Error("Connect your Para wallet before sending ETH."));
      return;
    }

    if (!isAddress(to)) {
      setError(new Error("Enter a valid recipient address."));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const hash = await viemClient.sendTransaction({
        account,
        chain: CHAIN,
        to,
        value: parseEther(amount),
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setTxHash(hash);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to send transaction"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendTransaction,
    txHash,
    isLoading,
    isReady,
    error,
    reset,
  };
}
