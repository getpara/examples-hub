"use client";

import { useState, useCallback } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useViemClient } from "@getpara/react-sdk/evm";
import { http } from "viem";
import { sepolia } from "viem/chains";

const HELLO_WORLD_MESSAGE = "Hello World!";

export function useSignHelloWorld() {
  const { isConnected, embedded } = useAccount();
  const address = embedded?.wallets?.[0]?.address as `0x${string}` | undefined;
  const { viemClient } = useViemClient({
    address,
    walletClientConfig: { chain: sepolia, transport: http() },
  });

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [signature, setSignature] = useState<string | undefined>();

  const sign = useCallback(async () => {
    if (!isConnected || !viemClient) return;

    setIsPending(true);
    setError(null);
    try {
      const sig = await viemClient.signMessage({ message: HELLO_WORLD_MESSAGE });
      setSignature(sig);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign"));
    } finally {
      setIsPending(false);
    }
  }, [isConnected, viemClient]);

  return {
    sign,
    message: HELLO_WORLD_MESSAGE,
    isPending,
    error,
    signature,
  };
}
