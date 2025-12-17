"use client";

import { useState, useCallback } from "react";
import type { GelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import type { GelatoSmartAccount } from "@gelatonetwork/smartwallet/accounts";
import type { Address, Hash, Hex, Transport, Chain } from "viem";

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
  client: GelatoSmartWalletClient<Transport, Chain, GelatoSmartAccount> | null
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
      if (!client) {
        throw new Error("Smart account client not initialized");
      }

      setIsPending(true);
      setError(null);
      setTxHash(null);

      try {
        const callsArray = Array.isArray(calls) ? calls : [calls];

        const formattedCalls = callsArray.map((call) => ({
          to: call.target,
          data: call.data ?? "0x",
          value: call.value ?? BigInt(0),
        }));

        const result = await client.execute({
          payment: { type: "sponsored" },
          calls: formattedCalls,
        });

        const hash = await result.wait();

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
