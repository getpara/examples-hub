"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useViemAccount } from "@getpara/react-sdk/evm";
import { createPublicClient, http, type Address } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { createSmartAccountClient, type SmartAccountClient } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { CHAIN, PIMLICO_API_KEY, PIMLICO_RPC_URL, SPONSORSHIP_POLICY_ID } from "@/lib/pimlico";

export interface UseSmartAccountClientResult {
  client: SmartAccountClient | null;
  address: Address | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSmartAccountClient(): UseSmartAccountClientResult {
  const { viemAccount, isLoading: isViemLoading } = useViemAccount();

  const [client, setClient] = useState<SmartAccountClient | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initializedForAddress = useRef<string | null>(null);

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain: CHAIN,
        transport: http(),
      }),
    []
  );

  const paymasterClient = useMemo(
    () =>
      createPimlicoClient({
        chain: CHAIN,
        transport: http(PIMLICO_RPC_URL),
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        },
      }),
    []
  );

  useEffect(() => {
    if (!viemAccount || isViemLoading || !PIMLICO_API_KEY) {
      return;
    }

    if (initializedForAddress.current === viemAccount.address) {
      return;
    }

    const initializeClient = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const smartAccount = await toSimpleSmartAccount({
          client: publicClient,
          owner: viemAccount,
          entryPoint: {
            address: entryPoint07Address,
            version: "0.7",
          },
        });

        const smartAccountClient = createSmartAccountClient({
          account: smartAccount,
          chain: CHAIN,
          bundlerTransport: http(PIMLICO_RPC_URL),
          paymaster: paymasterClient,
          paymasterContext: SPONSORSHIP_POLICY_ID
            ? { sponsorshipPolicyId: SPONSORSHIP_POLICY_ID }
            : undefined,
          userOperation: {
            estimateFeesPerGas: async () => (await paymasterClient.getUserOperationGasPrice()).fast,
          },
        });

        setClient(smartAccountClient);
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
  }, [viemAccount, isViemLoading, publicClient, paymasterClient]);

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
