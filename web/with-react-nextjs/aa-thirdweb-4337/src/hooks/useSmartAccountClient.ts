"use client";

import { useState, useEffect, useRef } from "react";
import { useViemAccount } from "@getpara/react-sdk/evm";
import { createWalletClient, http, type Address } from "viem";
import { smartWallet, type Account } from "thirdweb/wallets";
import { viemAdapter } from "thirdweb/adapters/viem";
import { thirdwebClient, CHAIN } from "@/lib/thirdweb";
import { sepolia } from "thirdweb/chains";

// Infer the WalletClient type that thirdweb expects from its bundled viem
type ThirdwebWalletClient = Parameters<typeof viemAdapter.wallet.fromViem>[0]['walletClient'];

export interface UseSmartAccountClientResult {
  client: Account | null;
  address: Address | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSmartAccountClient(): UseSmartAccountClientResult {
  const { viemAccount, isLoading: isViemLoading } = useViemAccount();

  const [client, setClient] = useState<Account | null>(null);
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
        const walletClient = createWalletClient({
          account: viemAccount,
          chain: CHAIN,
          transport: http(),
        });

        // Bridge viem version differences - types are structurally identical
        const paraWallet = viemAdapter.wallet.fromViem({
          walletClient: walletClient as ThirdwebWalletClient,
        });

        const personalAccount = paraWallet.getAccount();
        if (!personalAccount) {
          throw new Error("Failed to get account from Para wallet");
        }

        const wallet = smartWallet({
          chain: sepolia,
          sponsorGas: true,
        });

        const smartAccount = await wallet.connect({
          client: thirdwebClient,
          personalAccount,
        });

        setClient(smartAccount);
        setAddress(smartAccount.address as Address);
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
