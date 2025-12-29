"use client";

import { useState, useEffect, useRef } from "react";
import { useViemAccount } from "@getpara/react-sdk/evm";
import { accounts, createGelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import { createWalletClient, createPublicClient, http, type Address } from "viem";
import { GELATO_API_KEY, CHAIN } from "@/lib/gelato";
import type { GelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import type { GelatoSmartAccount } from "@gelatonetwork/smartwallet/accounts";

export interface UseSmartAccountClientResult {
  client: GelatoSmartWalletClient<ReturnType<typeof http>, typeof CHAIN, GelatoSmartAccount> | null;
  address: Address | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSmartAccountClient(): UseSmartAccountClientResult {
  const { viemAccount, isLoading: isViemLoading } = useViemAccount();

  const [client, setClient] = useState<GelatoSmartWalletClient<
    ReturnType<typeof http>,
    typeof CHAIN,
    GelatoSmartAccount
  > | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initializedForAddress = useRef<string | null>(null);

  useEffect(() => {
    if (!viemAccount || isViemLoading || !GELATO_API_KEY) {
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
          transport: http(),
        });

        // Create Kernel account (ERC-4337)
        const kernelAccount = await accounts.kernel({
          owner: viemAccount,
          client: publicClient,
          index: BigInt(0),
          eip7702: false,
        });

        const walletClient = createWalletClient({
          account: kernelAccount,
          chain: CHAIN,
          transport: http(),
        });

        const smartWalletClient = await createGelatoSmartWalletClient(walletClient, {
          apiKey: GELATO_API_KEY,
        });

        setClient(smartWalletClient);
        setAddress(kernelAccount.address);
        initializedForAddress.current = viemAccount.address;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to initialize smart account");
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
