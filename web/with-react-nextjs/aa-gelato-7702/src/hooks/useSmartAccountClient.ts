"use client";

import { useState, useEffect, useRef } from "react";
import { useViemAccount } from "@getpara/react-sdk/evm";
import { gelato } from "@gelatonetwork/smartwallet/accounts";
import { createGelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
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

        // Create Gelato account (EIP-7702)
        // The smart account address is the same as the EOA address
        const smartAccount = await gelato({
          owner: viemAccount,
          client: publicClient,
        });

        const walletClient = createWalletClient({
          account: smartAccount,
          chain: CHAIN,
          transport: http(),
        });

        const smartWalletClient = await createGelatoSmartWalletClient(walletClient, {
          apiKey: GELATO_API_KEY,
        });

        setClient(smartWalletClient);
        setAddress(smartAccount.address);
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
