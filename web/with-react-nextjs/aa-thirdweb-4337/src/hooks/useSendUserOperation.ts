"use client";

import { useState, useCallback } from "react";
import { prepareTransaction, sendTransaction } from "thirdweb";
import type { Account } from "thirdweb/wallets";
import type { Address, Hash } from "viem";
import { thirdwebClient } from "@/lib/thirdweb";
import { sepolia } from "thirdweb/chains";

export interface UserOperationCall {
  target: Address;
  data?: `0x${string}`;
  value?: bigint;
}

export interface UseSendUserOperationResult {
  sendUserOperation: (calls: UserOperationCall | UserOperationCall[]) => Promise<Hash>;
  isPending: boolean;
  txHash: Hash | null;
  error: Error | null;
  reset: () => void;
}

export function useSendUserOperation(client: Account | null): UseSendUserOperationResult {
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
      if (!client) {
        throw new Error("Smart account client not initialized");
      }

      setIsPending(true);
      setError(null);
      setTxHash(null);

      try {
        const callsArray = Array.isArray(calls) ? calls : [calls];
        const call = callsArray[0];

        const transaction = prepareTransaction({
          client: thirdwebClient,
          chain: sepolia,
          to: call.target,
          data: call.data,
          value: call.value ?? BigInt(0),
        });

        const result = await sendTransaction({
          account: client,
          transaction,
        });

        const hash = result.transactionHash as Hash;
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
