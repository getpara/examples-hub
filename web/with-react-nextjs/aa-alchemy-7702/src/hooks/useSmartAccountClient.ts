"use client";

import { useState, useEffect, useRef } from "react";
import { useViemAccount } from "@getpara/react-sdk/evm";
import { createModularAccountV2Client, type ModularAccountV2Client } from "@account-kit/smart-contracts";
import { alchemy, sepolia } from "@account-kit/infra";
import { WalletClientSigner } from "@aa-sdk/core";
import { createWalletClient, http, type Address } from "viem";
import { ALCHEMY_API_KEY, GAS_POLICY_ID, CHAIN } from "@/lib/alchemy";

export interface UseSmartAccountClientResult {
  client: ModularAccountV2Client | null;
  address: Address | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSmartAccountClient(): UseSmartAccountClientResult {
  const { viemAccount, isLoading: isViemLoading } = useViemAccount();

  const [client, setClient] = useState<ModularAccountV2Client | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initializedForAddress = useRef<string | null>(null);

  useEffect(() => {
    if (!viemAccount || isViemLoading || !ALCHEMY_API_KEY) {
      return;
    }

    if (initializedForAddress.current === viemAccount.address) {
      return;
    }

    const initializeClient = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const walletClient = createWalletClient({
          account: viemAccount,
          chain: CHAIN,
          transport: http(),
        });

        const signer = new WalletClientSigner(walletClient, "para");

        const accountClient = await createModularAccountV2Client({
          mode: "7702",
          transport: alchemy({ apiKey: ALCHEMY_API_KEY }),
          chain: sepolia,
          signer,
          policyId: GAS_POLICY_ID || undefined,
        });

        setClient(accountClient);
        setAddress(accountClient.account.address);
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
