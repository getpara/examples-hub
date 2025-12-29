"use client";

import { useState, useCallback } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useViemClient } from "@getpara/react-sdk/evm";
import { http } from "viem";
import type { Hash, Address, Abi } from "viem";
import { publicClient, CHAIN } from "@/lib/viem";

export interface WriteContractParams {
  address: Address;
  abi: Abi;
  functionName: string;
  args?: unknown[];
  value?: bigint;
}

export interface UseWriteContractResult {
  writeContract: (params: WriteContractParams) => Promise<Hash>;
  isPending: boolean;
  txHash: Hash | null;
  error: Error | null;
  reset: () => void;
}

export function useWriteContract(): UseWriteContractResult {
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

  const writeContract = useCallback(
    async (params: WriteContractParams): Promise<Hash> => {
      if (!isConnected || !viemClient) {
        throw new Error("Wallet not connected");
      }

      setIsPending(true);
      setError(null);
      setTxHash(null);

      try {
        const hash = await viemClient.writeContract({
          address: params.address,
          abi: params.abi,
          functionName: params.functionName,
          args: params.args ?? [],
          value: params.value,
        });

        await publicClient.waitForTransactionReceipt({ hash });

        setTxHash(hash);
        setIsPending(false);
        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to write contract");
        setError(error);
        setIsPending(false);
        throw error;
      }
    },
    [isConnected, viemClient]
  );

  return {
    writeContract,
    isPending,
    txHash,
    error,
    reset,
  };
}
