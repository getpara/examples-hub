"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet, useAccount } from "@getpara/react-sdk";
import Para, { Environment } from "@getpara/web-sdk";
import { createParaAccount } from "@getpara/viem-v2-integration";
import { http, type LocalAccount } from "viem";
import {
  createMeeClient,
  toMultichainNexusAccount,
  getMEEVersion,
  MEEVersion,
  type MeeClient,
  type MultichainSmartAccount,
} from "@biconomy/abstractjs";
import { CHAIN } from "@/lib/biconomy";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

// Create Para client at module level - shares session with React SDK
const para = new Para(ENVIRONMENT, API_KEY);

export interface UseMeeClientResult {
  meeClient: MeeClient | null;
  orchestrator: MultichainSmartAccount | null;
  isLoading: boolean;
  error: Error | null;
}

export function useMeeClient(): UseMeeClientResult {
  const { data: wallet } = useWallet();
  const { isConnected } = useAccount();

  const [meeClient, setMeeClient] = useState<MeeClient | null>(null);
  const [orchestrator, setOrchestrator] = useState<MultichainSmartAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initializedForAddress = useRef<string | null>(null);

  useEffect(() => {
    if (!wallet?.address || !isConnected) {
      return;
    }

    // Prevent re-initialization for the same wallet
    if (initializedForAddress.current === wallet.address) {
      return;
    }

    const initMee = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Create a Para viem account using the @getpara/viem-v2-integration package
        // This creates a LocalAccount that delegates signing to Para's signing methods
        const viemParaAccount = await createParaAccount(para);

        // Create multichain account - this creates a Companion Smart Account (orchestrator)
        // The orchestrator acts as a passthrough executor that handles batching and fee payments
        const multiAccount = await toMultichainNexusAccount({
          chainConfigurations: [
            {
              chain: CHAIN,
              transport: http(),
              version: getMEEVersion(MEEVersion.V2_1_0),
            },
          ],
          // Cast to any to bypass AbstractJS type restrictions
          // The account implements all required signing methods
          signer: viemParaAccount as LocalAccount as unknown as LocalAccount,
        });
        setOrchestrator(multiAccount);

        const mee = await createMeeClient({ account: multiAccount });
        setMeeClient(mee);
        initializedForAddress.current = wallet.address;
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error("Failed to initialize MEE client");
        setError(errorMessage);
        setMeeClient(null);
        setOrchestrator(null);
      } finally {
        setIsLoading(false);
      }
    };

    initMee();
  }, [wallet?.address, isConnected]);

  // Reset state when wallet disconnects
  useEffect(() => {
    if (!wallet?.address && !isConnected) {
      setMeeClient(null);
      setOrchestrator(null);
      setError(null);
      initializedForAddress.current = null;
    }
  }, [wallet?.address, isConnected]);

  return {
    meeClient,
    orchestrator,
    isLoading,
    error,
  };
}

