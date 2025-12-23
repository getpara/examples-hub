"use client";

import { useState, useEffect, useRef } from "react";
import { useViemAccount } from "@getpara/react-sdk/evm";
import { createZeroDevPaymasterClient } from "@zerodev/sdk";
import { create7702KernelAccount, create7702KernelAccountClient } from "@zerodev/ecdsa-validator";
import { createPublicClient, http, type Address } from "viem";
import { BUNDLER_RPC, PAYMASTER_RPC, PUBLIC_RPC, ENTRY_POINT, KERNEL_VERSION, CHAIN } from "@/lib/zerodev";
import type { KernelAccountClient } from "@zerodev/sdk";

export interface UseSmartAccountClientResult {
  client: KernelAccountClient | null;
  address: Address | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSmartAccountClient(): UseSmartAccountClientResult {
  const { viemAccount, isLoading: isViemLoading } = useViemAccount();

  const [client, setClient] = useState<KernelAccountClient | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initializedForAddress = useRef<string | null>(null);

  useEffect(() => {
    if (!viemAccount || isViemLoading) {
      return;
    }

    if (initializedForAddress.current === viemAccount.address) {
      return;
    }

    const initializeClient = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const publicClient = createPublicClient({
          chain: CHAIN,
          transport: http(PUBLIC_RPC),
        });

        const kernelAccount = await create7702KernelAccount(publicClient, {
          signer: viemAccount,
          entryPoint: ENTRY_POINT,
          kernelVersion: KERNEL_VERSION,
        });

        const paymasterClient = createZeroDevPaymasterClient({
          chain: CHAIN,
          transport: http(PAYMASTER_RPC),
        });

        const kernelClient = create7702KernelAccountClient({
          account: kernelAccount,
          chain: CHAIN,
          bundlerTransport: http(BUNDLER_RPC),
          paymaster: paymasterClient,
          client: publicClient,
        });

        setClient(kernelClient as KernelAccountClient);
        setAddress(kernelAccount.address);
        initializedForAddress.current = viemAccount.address;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to initialize 7702 account");
        setError(error);
        setClient(null);
        setAddress(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();
  }, [viemAccount, isViemLoading]);

  useEffect(() => {
    if (!viemAccount && !isViemLoading) {
      setClient(null);
      setAddress(null);
      setError(null);
      initializedForAddress.current = null;
    }
  }, [viemAccount, isViemLoading]);

  return {
    client,
    address,
    isLoading: isLoading || isViemLoading,
    error,
  };
}
