"use client";

import { useState, useCallback } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useViemClient } from "@getpara/react-sdk/evm";
import { http } from "viem";
import type { Hash, TypedDataDomain } from "viem";
import { CHAIN } from "@/lib/viem";

export interface SignTypedDataParams {
  domain: TypedDataDomain;
  types: Record<string, { name: string; type: string }[]>;
  primaryType: string;
  message: Record<string, unknown>;
}

export interface UseSignTypedDataResult {
  signTypedData: (params: SignTypedDataParams) => Promise<Hash>;
  isPending: boolean;
  signature: Hash | null;
  error: Error | null;
  reset: () => void;
}

export function useSignTypedData(): UseSignTypedDataResult {
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

  const signTypedData = useCallback(
    async (params: SignTypedDataParams): Promise<Hash> => {
      if (!isConnected || !viemClient) {
        throw new Error("Wallet not connected");
      }

      setIsPending(true);
      setError(null);
      setSignature(null);

      try {
        const sig = await viemClient.signTypedData({
          domain: params.domain,
          types: params.types,
          primaryType: params.primaryType,
          message: params.message,
        });

        setSignature(sig);
        setIsPending(false);
        return sig;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to sign typed data");
        setError(error);
        setIsPending(false);
        throw error;
      }
    },
    [isConnected, viemClient]
  );

  return {
    signTypedData,
    isPending,
    signature,
    error,
    reset,
  };
}
