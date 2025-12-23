"use client";

import { useState, useCallback } from "react";
import type { KernelAccountClient } from "@zerodev/sdk";
import type { Address, Hash, Hex } from "viem";

export interface UserOperationCall {
  target: Address;
  data?: Hex;
  value?: bigint;
}

export interface UseSendUserOperationResult {
  sendUserOperation: (calls: UserOperationCall | UserOperationCall[]) => Promise<Hash>;
  isPending: boolean;
  txHash: Hash | null;
  error: Error | null;
  reset: () => void;
}

export function useSendUserOperation(
  client: KernelAccountClient | null
): UseSendUserOperationResult {
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setIsPending(false);
    setTxHash(null);
    setError(null);
  }, []);

  const sendUserOperation = useCallback(
    async (calls: UserOperationCall | UserOperationCall[]): Promise<Hash> => {
      if (!client || !client.account) {
        throw new Error("Smart account client not initialized");
      }

      setIsPending(true);
      setError(null);
      setTxHash(null);

      try {
        const callsArray = Array.isArray(calls) ? calls : [calls];

        const formattedCalls = callsArray.map((call) => ({
          to: call.target,
          data: call.data ?? "0x" as Hex,
          value: call.value ?? BigInt(0),
        }));

        const userOpHash = await client.sendUserOperation({
          callData: await client.account.encodeCalls(formattedCalls),
        });

        const receipt = await client.waitForUserOperationReceipt({
          hash: userOpHash,
        });

        const hash = receipt.receipt.transactionHash;
        setTxHash(hash);
        setIsPending(false);

        return hash;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to send user operation");
        setError(error);
        setIsPending(false);
        throw error;
      }
    },
    [client]
  );

  return {
    sendUserOperation,
    isPending,
    txHash,
    error,
    reset,
  };
}
