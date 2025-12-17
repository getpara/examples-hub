"use client";

import { useState, useCallback } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useViemClient } from "@getpara/react-sdk/evm";
import { http } from "viem";
import type { Hash } from "viem";
import { CHAIN } from "@/lib/viem";

export interface UseSignMessageResult {
  signMessage: (message: string) => Promise<Hash>;
  isPending: boolean;
  signature: Hash | null;
  error: Error | null;
  reset: () => void;
}

export function useSignMessage(): UseSignMessageResult {
  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { viemClient } = useViemClient({ address, walletClientConfig: { chain: CHAIN, transport: http() } });

  const [isPending, setIsPending] = useState(false);
  const [signature, setSignature] = useState<Hash | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setIsPending(false);
    setSignature(null);
    setError(null);
  }, []);

  const signMessage = useCallback(
    async (message: string): Promise<Hash> => {
      if (!isConnected || !viemClient) {
        throw new Error("Wallet not connected");
      }

      setIsPending(true);
      setError(null);
      setSignature(null);

      try {
        const sig = await viemClient.signMessage({ message });
        setSignature(sig);
        setIsPending(false);
        return sig;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to sign message");
        setError(error);
        setIsPending(false);
        throw error;
      }
    },
    [isConnected, viemClient]
  );

  return {
    signMessage,
    isPending,
    signature,
    error,
    reset,
  };
}
