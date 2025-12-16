"use client";

import { useState, useEffect, useCallback } from "react";
import { useViemAccount } from "@getpara/react-sdk/evm";
import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { alchemy, sepolia } from "@account-kit/infra";
import { WalletClientSigner } from "@aa-sdk/core";
import { createWalletClient, http, type Hash } from "viem";
import { ALCHEMY_API_KEY, GAS_POLICY_ID, CHAIN } from "@/lib/alchemy";

export interface SmartAccountState {
  smartAccountAddress: string | null;
  isInitializing: boolean;
  error: Error | null;
}

export function useAlchemySmartAccount() {
  const { viemAccount, isLoading: isViemLoading } = useViemAccount();

  const [state, setState] = useState<SmartAccountState>({
    smartAccountAddress: null,
    isInitializing: false,
    error: null,
  });

  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [txError, setTxError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeSmartAccount = async () => {
      if (!viemAccount || isViemLoading || !ALCHEMY_API_KEY) {
        return;
      }

      setState((prev) => ({ ...prev, isInitializing: true, error: null }));

      try {
        // Create wallet client from Para's viem account
        const walletClient = createWalletClient({
          account: viemAccount,
          chain: CHAIN,
          transport: http(),
        });

        // Wrap as WalletClientSigner for Alchemy SDK
        const signer = new WalletClientSigner(walletClient, "para");

        // Create modular account client with gas sponsorship
        const client = await createModularAccountV2Client({
          transport: alchemy({ apiKey: ALCHEMY_API_KEY }),
          chain: sepolia,
          signer,
          policyId: GAS_POLICY_ID || undefined,
        });

        setState({
          smartAccountAddress: client.account.address,
          isInitializing: false,
          error: null,
        });
      } catch (error) {
        console.error("Failed to initialize smart account:", error);
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          error: error instanceof Error ? error : new Error("Failed to initialize smart account"),
        }));
      }
    };

    initializeSmartAccount();
  }, [viemAccount, isViemLoading]);

  const sendSponsoredTransaction = useCallback(async (): Promise<Hash> => {
    if (!viemAccount || !ALCHEMY_API_KEY) {
      throw new Error("Smart account not initialized");
    }

    setIsPending(true);
    setTxError(null);
    setTxHash(null);

    try {
      // Create wallet client from Para's viem account
      const walletClient = createWalletClient({
        account: viemAccount,
        chain: CHAIN,
        transport: http(),
      });

      const signer = new WalletClientSigner(walletClient, "para");

      const client = await createModularAccountV2Client({
        transport: alchemy({ apiKey: ALCHEMY_API_KEY }),
        chain: sepolia,
        signer,
        policyId: GAS_POLICY_ID || undefined,
      });

      // Send a simple sponsored transaction (0 ETH to a burn address)
      // Using a real target address with 0 value to demonstrate gas sponsorship
      const userOpHash = await client.sendUserOperation({
        uo: {
          target: "0x000000000000000000000000000000000000dEaD",
          data: "0x",
          value: BigInt(0),
        },
      });

      // Wait for transaction to be mined
      const txHash = await client.waitForUserOperationTransaction(userOpHash);

      setTxHash(txHash);
      setIsPending(false);

      return txHash;
    } catch (error) {
      console.error("Failed to send sponsored transaction:", error);
      const err = error instanceof Error ? error : new Error("Transaction failed");
      setTxError(err);
      setIsPending(false);
      throw err;
    }
  }, [viemAccount]);

  return {
    ...state,
    isReady: !!state.smartAccountAddress && !state.isInitializing,
    sendSponsoredTransaction,
    isPending,
    txHash,
    txError,
  };
}
