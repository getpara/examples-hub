"use client";

import { useMemo, useEffect, useState } from "react";
import { useAccount, useClient } from "@getpara/react-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { createPublicClient, http, PublicClient, WalletClient } from "viem";
import { sepolia, baseSepolia } from "viem/chains";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection } from "@solana/web3.js";
import { NETWORK_CONFIG } from "@/config/constants";

export function useSigners() {
  const client = useClient();
  const { isConnected } = useAccount();

  // Ethereum signer setup
  const ethereumViem = useMemo(() => {
    if (!client || !isConnected) {
      return { publicClient: null, walletClient: null, address: null, isInitialized: false };
    }

    try {
      const ethereumChain = sepolia;
      const ethereumConfig = NETWORK_CONFIG.ethereum;
      const ethereumAccount = createParaAccount(client);
      const ethereumWalletClient = createParaViemClient(client, {
        account: ethereumAccount,
        chain: ethereumChain,
        transport: http(ethereumConfig.rpcUrl),
      });
      const ethereumPublicClient = createPublicClient({
        chain: ethereumChain,
        transport: http(ethereumConfig.rpcUrl),
      });

      return {
        walletClient: ethereumWalletClient,
        publicClient: ethereumPublicClient as PublicClient,
        address: ethereumAccount.address,
        isInitialized: true,
      };
    } catch (error) {
      console.error("[Ethereum Signer] Initialization error:", error);
      return { publicClient: null, walletClient: null, address: null, isInitialized: false };
    }
  }, [client, isConnected]);

  // Base signer setup
  const baseViem = useMemo(() => {
    if (!client || !isConnected) {
      return { publicClient: null, walletClient: null, address: null, isInitialized: false };
    }

    try {
      const baseChain = baseSepolia;
      const baseConfig = NETWORK_CONFIG.base;
      const baseAccount = createParaAccount(client);
      const baseWalletClient = createParaViemClient(client, {
        account: baseAccount,
        chain: baseChain,
        transport: http(baseConfig.rpcUrl),
      });
      const basePublicClient = createPublicClient({
        chain: baseChain,
        transport: http(baseConfig.rpcUrl),
      });

      return {
        walletClient: baseWalletClient,
        publicClient: basePublicClient as PublicClient,
        address: baseAccount.address,
        isInitialized: true,
      };
    } catch (error) {
      console.error("[Base Signer] Initialization error:", error);
      return { publicClient: null, walletClient: null, address: null, isInitialized: false };
    }
  }, [client, isConnected]);

  // Solana address state
  const [solanaAddress, setSolanaAddress] = useState<string | null>(null);

  // Solana signer setup
  const solanaSvm = useMemo(() => {
    if (!client || !isConnected) {
      return { signer: null, connection: null, address: null, isInitialized: false };
    }

    try {
      const solanaConfig = NETWORK_CONFIG.solana;
      const solanaConnection = new Connection(solanaConfig.rpcUrl, "confirmed");
      const solanaSigner = new ParaSolanaWeb3Signer(client, solanaConnection);

      return {
        signer: solanaSigner,
        connection: solanaConnection,
        address: solanaAddress,
        isInitialized: true,
      };
    } catch (error) {
      console.error("[Solana Signer] Initialization error:", error);
      return { signer: null, connection: null, address: null, isInitialized: false };
    }
  }, [client, isConnected, solanaAddress]);

  // Get Solana address asynchronously
  useEffect(() => {
    if (solanaSvm.signer && isConnected) {
      const getSolanaAddress = async () => {
        try {
          const publicKey = await solanaSvm.signer.sender;
          if (publicKey) {
            setSolanaAddress(publicKey.toBase58());
          }
        } catch (error) {
          console.error("[Solana Signer] Error getting address:", error);
        }
      };
      getSolanaAddress();
    } else {
      setSolanaAddress(null);
    }
  }, [solanaSvm.signer, isConnected]);

  return {
    ethereumViem,
    baseViem,
    solanaSvm,
  };
}
