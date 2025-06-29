"use client";

import { useEffect, useState } from "react";
import { useAccount, useClient } from "@getpara/react-sdk";
import { ParaEthersV5Signer } from "@getpara/ethers-v5-integration";
import { useEthersProvider } from "./useEthersProvider";

export function useParaSigner() {
  const { data: account } = useAccount();
  const client = useClient();
  const { provider } = useEthersProvider();
  const [signer, setSigner] = useState<ParaEthersV5Signer | null>(null);

  useEffect(() => {
    if (account?.isConnected && provider && client) {
      try {
        const newSigner = new ParaEthersV5Signer(client, provider);
        setSigner(newSigner);
      } catch (error) {
        console.error("Failed to initialize Para signer:", error);
        setSigner(null);
      }
    } else {
      setSigner(null);
    }
  }, [account?.isConnected, provider, client]);

  return {
    signer,
    provider,
  };
}