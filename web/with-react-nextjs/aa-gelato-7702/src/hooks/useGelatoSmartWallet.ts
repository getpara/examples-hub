"use client";

import { useEffect, useState } from "react";
import { createGelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import { gelato } from "@gelatonetwork/smartwallet/accounts";
import { useViemAccount } from "@getpara/react-sdk/evm";
import { useClient } from "@getpara/react-sdk";
import { createPublicClient, createWalletClient, http, HttpTransport, type Hex, type Hash } from "viem";
import { sepolia } from "viem/chains";
import type { GelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import type { GelatoSmartAccount } from "@gelatonetwork/smartwallet/accounts";
import { customSignMessage, customSignAuthorization, customSignTypedData } from "@/utils/paraSignature";
import { GELATO_API_KEY } from "@/config/constants";

export interface SponsoredTransactionResult {
  taskId: Hex;
  txHash: Hash;
}

export interface GelatoSmartWalletState {
  smartAccount: GelatoSmartAccount | null;
  smartWalletClient: GelatoSmartWalletClient<HttpTransport, typeof sepolia, GelatoSmartAccount> | null;
  isInitializing: boolean;
  error: Error | null;
}

export function useGelatoSmartWallet() {
  const { viemAccount: paraViemAccount } = useViemAccount();
  const paraClient = useClient();
  const [state, setState] = useState<GelatoSmartWalletState>({
    smartAccount: null,
    smartWalletClient: null,
    isInitializing: false,
    error: null,
  });

  useEffect(() => {
    const initializeGelatoWallet = async () => {
      if (!paraViemAccount || !paraClient || !GELATO_API_KEY) {
        return;
      }

      setState((prev) => ({ ...prev, isInitializing: true, error: null }));

      try {
        // Add custom signing methods to the Para Viem account
        paraViemAccount.signMessage = async ({ message }) => customSignMessage(paraClient, message);
        paraViemAccount.signAuthorization = async (authorization) => customSignAuthorization(paraClient, authorization);
        paraViemAccount.signTypedData = async (data) => customSignTypedData(paraClient, data);

        // Create public client for Base Sepolia
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http(),
        });

        // Create Gelato Smart Account with EIP-7702 support
        const smartAccount = await gelato({
          owner: paraViemAccount,
          client: publicClient,
        });

        // Create wallet client from Para's Viem account with custom signing
        const walletClient = createWalletClient({
          account: smartAccount,
          chain: sepolia,
          transport: http(),
        });

        // Create Gelato Smart Wallet Client with sponsorship
        const smartWalletClient = await createGelatoSmartWalletClient(walletClient, {
          apiKey: GELATO_API_KEY,
        });
        setState({
          smartAccount,
          smartWalletClient,
          isInitializing: false,
          error: null,
        });
      } catch (error) {
        console.error("Failed to initialize Gelato smart wallet:", error);
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          error: error instanceof Error ? error : new Error("Failed to initialize Gelato smart wallet"),
        }));
      }
    };

    initializeGelatoWallet();
  }, [paraViemAccount, paraClient]);

  const sendSponsoredTransaction = async (): Promise<SponsoredTransactionResult> => {
    const { smartAccount, smartWalletClient } = state;

    if (!smartAccount || !smartWalletClient) {
      throw new Error("Gelato smart wallet not initialized");
    }

    try {
      // Send sponsored UserOperation - returns GelatoResponse
      const result = await smartWalletClient.execute({
        payment: { type: "sponsored" },
        calls: [
          {
            to: "0xa8851f5f279eD47a292f09CA2b6D40736a51788E",
            data: "0xd09de08a",
            value: BigInt(0),
          },
        ],
      });

      // Wait for the transaction to be executed and get the actual transaction hash
      const txHash = await result.wait();

      // Return both the task ID and transaction hash
      return {
        taskId: result.id,
        txHash: txHash,
      };
    } catch (error) {
      console.error("Failed to send sponsored transaction:", error);
      throw error;
    }
  };

  return {
    ...state,
    sendSponsoredTransaction,
    isReady: !!state.smartAccount && !!state.smartWalletClient,
  };
}
