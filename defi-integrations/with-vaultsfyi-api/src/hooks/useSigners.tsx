"use client";

import { useMemo } from "react";
import { useAccount, useClient } from "@getpara/react-sdk";
import {
  createParaViemAccount,
  createParaViemClient,
} from "@getpara/viem-v2-integration";
import { createPublicClient, http, type PublicClient } from "viem";
import { BASE_CHAIN, BASE_RPC_URL } from "@/config/constants";

/**
 * Builds a viem WalletClient + PublicClient backed by the user's Para MPC wallet.
 * Mirrors the exact pattern from
 * defi-integrations/with-relay-bridge-api/src/hooks/useSigners.tsx in this repo.
 *
 * Returns nulls until Para reports the user as connected and the viem account
 * can be derived. Components should gate transaction calls on
 * `isInitialized === true`.
 *
 * Single-chain (Base mainnet) because vaults.fyi indexes mainnet vaults only.
 * To extend to other networks vaults.fyi supports (Ethereum, Arbitrum,
 * Optimism, Polygon, etc.), add additional `useMemo` blocks mirroring this
 * one and switch on the chainId returned by vaults.fyi's `actions[]`.
 */
export function useSigners() {
  const client = useClient();
  const { isConnected } = useAccount();

  const base = useMemo(() => {
    if (!client || !isConnected) {
      return {
        publicClient: null,
        walletClient: null,
        address: null,
        isInitialized: false,
      };
    }

    try {
      const account = createParaViemAccount({ para: client });
      const walletClient = createParaViemClient({
        para: client,
        walletClientConfig: {
          account,
          chain: BASE_CHAIN,
          transport: http(BASE_RPC_URL),
        },
      });
      const publicClient = createPublicClient({
        chain: BASE_CHAIN,
        transport: http(BASE_RPC_URL),
      });

      return {
        walletClient,
        publicClient: publicClient as PublicClient,
        address: account.address,
        isInitialized: true,
      };
    } catch (error) {
      console.error("[Base Signer] Initialization error:", error);
      return {
        publicClient: null,
        walletClient: null,
        address: null,
        isInitialized: false,
      };
    }
  }, [client, isConnected]);

  return { base };
}
