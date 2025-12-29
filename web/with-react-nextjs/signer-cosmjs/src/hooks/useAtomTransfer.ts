"use client";

import { useState, useCallback } from "react";
import { coins } from "@cosmjs/stargate";
import { useParaSigner } from "./useParaSigner";
import { DEFAULT_CHAIN } from "@/config/chains";

export function useAtomTransfer() {
  const [txHash, setTxHash] = useState<string | null>(null);
  const [gasUsed, setGasUsed] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address, isLoading: isSignerLoading } = useParaSigner();

  const sendTokens = useCallback(
    async (recipient: string, amount: string) => {
      if (!address) {
        throw new Error("Please connect your wallet to send a transaction.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      if (!recipient.startsWith("cosmos")) {
        throw new Error("Invalid recipient address. Must start with 'cosmos'.");
      }

      const amountInMinimalDenom = Math.floor(
        parseFloat(amount) * Math.pow(10, DEFAULT_CHAIN.coinDecimals)
      );
      if (isNaN(amountInMinimalDenom) || amountInMinimalDenom <= 0) {
        throw new Error("Invalid amount. Please enter a valid positive number.");
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);
      setGasUsed(null);

      try {
        const result = await signingClient.sendTokens(
          address,
          recipient,
          coins(amountInMinimalDenom, DEFAULT_CHAIN.coinMinimalDenom),
          "auto",
          "Sent via Para + CosmJS"
        );

        setTxHash(result.transactionHash);
        setGasUsed(result.gasUsed);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to send transaction");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signingClient, address]
  );

  const reset = useCallback(() => {
    setTxHash(null);
    setGasUsed(null);
    setError(null);
  }, []);

  return {
    sendTokens,
    txHash,
    gasUsed,
    isLoading: isLoading || isSignerLoading,
    isReady: !!signingClient && !!address,
    error,
    reset,
  };
}
