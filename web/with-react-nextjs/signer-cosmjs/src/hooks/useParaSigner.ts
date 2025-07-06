"use client";

import { useState, useEffect, useCallback } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { ParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { useAccount, useClient, useWallet } from "@getpara/react-sdk";
import { GasPrice } from "@cosmjs/stargate";
import { DEFAULT_CHAIN } from "@/config/chains";
import { DEFAULT_GAS_PRICE } from "@/config/constants";

export function useParaSigner() {
  const [signingClient, setSigningClient] = useState<SigningStargateClient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { isConnected } = useAccount();
  const client = useClient();
  const { data: wallet } = useWallet();

  const connect = useCallback(async () => {
    if (!isConnected || !client) return;

    setLoading(true);
    setError(null);
    
    try {
      const address = wallet?.address;
      if (!address) {
        throw new Error("No wallet address found");
      }

      const signer = new ParaProtoSigner(client);
      const cosmosClient = await SigningStargateClient.connectWithSigner(
        DEFAULT_CHAIN.rpc,
        signer,
        {
          gasPrice: GasPrice.fromString(DEFAULT_GAS_PRICE),
        }
      );

      setSigningClient(cosmosClient);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to connect signer"));
      console.error("Error connecting Para signer:", err);
    } finally {
      setLoading(false);
    }
  }, [isConnected, client, wallet]);

  useEffect(() => {
    if (isConnected && client) {
      connect();
    } else {
      setSigningClient(null);
    }
  }, [isConnected, client, connect]);

  return { signingClient, loading, error, reconnect: connect };
}