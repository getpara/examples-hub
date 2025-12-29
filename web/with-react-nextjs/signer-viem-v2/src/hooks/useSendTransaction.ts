"use client";

import { useState, useCallback } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useViemClient } from "@getpara/react-sdk/evm";
import { http } from "viem";
import type { Hash, Address, Hex } from "viem";
import { publicClient, CHAIN } from "@/lib/viem";

export interface SendTransactionParams {
  to: Address;
  value?: bigint;
  data?: Hex;
}

export interface UseSendTransactionResult {
  sendTransaction: (params: SendTransactionParams) => Promise<Hash>;
  isPending: boolean;
  txHash: Hash | null;
  error: Error | null;
  reset: () => void;
}

export function useSendTransaction(): UseSendTransactionResult {
  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { viemClient } = useViemClient({ address, walletClientConfig: { chain: CHAIN, transport: http() } });

  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setIsPending(false);
    setTxHash(null);
    setError(null);
  }, []);

  const sendTransaction = useCallback(
    async (params: SendTransactionParams): Promise<Hash> => {
      if (!isConnected || !viemClient) {
        throw new Error("Wallet not connected");
      }

      setIsPending(true);
      setError(null);
      setTxHash(null);

      try {
        const hash = await viemClient.sendTransaction({
          to: params.to,
          value: params.value ?? BigInt(0),
          data: params.data,
        });

        await publicClient.waitForTransactionReceipt({ hash });

        setTxHash(hash);
        setIsPending(false);
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to send transaction");
        setError(error);
        setIsPending(false);
        throw error;
      }
    },
    [isConnected, viemClient]
  );

  return {
    sendTransaction,
    isPending,
    txHash,
    error,
    reset,
  };
}
