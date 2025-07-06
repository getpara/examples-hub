"use client";

import { useEffect, useState } from "react";
import { useAccount, useClient } from "@getpara/react-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { useEthersProvider } from "./useEthersProvider";

export function useParaSigner() {
  const { isConnected } = useAccount();
  const client = useClient();
  const { provider } = useEthersProvider();
  const [signer, setSigner] = useState<ParaEthersSigner | null>(null);

  useEffect(() => {
    if (isConnected && provider && client) {
      try {
        const newSigner = new ParaEthersSigner(client, provider);
        setSigner(newSigner);
      } catch (error) {
        console.error("Failed to initialize Para signer:", error);
        setSigner(null);
      }
    } else {
      setSigner(null);
    }
  }, [isConnected, provider, client]);

  return {
    signer,
    provider,
  };
}