"use client";

import { useState, useEffect } from "react";
import { SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import { useParaCosmjsProtoSigner } from "@getpara/react-sdk/cosmos";
import { useAccount } from "@getpara/react-sdk";
import { DEFAULT_CHAIN } from "@/config/chains";
import { DEFAULT_GAS_PRICE } from "@/config/constants";

export function useParaSigner() {
  const [signingClient, setSigningClient] = useState<SigningStargateClient | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { isConnected } = useAccount();
  const { protoSigner, isLoading: isSignerLoading } = useParaCosmjsProtoSigner();

  // Get the Cosmos address directly from the signer
  const address = isConnected && protoSigner ? protoSigner.address : null;

  useEffect(() => {
    // Clear client when disconnected or no signer available
    if (!isConnected || !protoSigner) {
      setSigningClient(null);
      setError(null);
      setIsConnecting(false);
      return;
    }

    let mounted = true;

    const connectClient = async () => {
      setIsConnecting(true);
      try {
        const client = await SigningStargateClient.connectWithSigner(
          DEFAULT_CHAIN.rpc,
          protoSigner,
          { gasPrice: GasPrice.fromString(DEFAULT_GAS_PRICE) }
        );

        if (mounted) {
          setSigningClient(client);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setSigningClient(null);
          setError(err instanceof Error ? err : new Error("Failed to connect signing client"));
          console.error("Error connecting Para signer:", err);
        }
      } finally {
        if (mounted) {
          setIsConnecting(false);
        }
      }
    };

    connectClient();

    return () => {
      mounted = false;
    };
  }, [isConnected, protoSigner]);

  // isLoading is true when either the signer is loading OR we're connecting the client
  const isLoading = isSignerLoading || isConnecting;

  return { signingClient, address, isLoading, error };
}
