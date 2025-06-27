"use client";

import { useEffect, useState } from "react";
import { useAccount, useClient } from "@getpara/react-sdk";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { useSolana } from "./useSolana";

export function useParaSigner() {
  const { data: account } = useAccount();
  const client = useClient();
  const { connection } = useSolana();
  const [signer, setSigner] = useState<ParaSolanaWeb3Signer | null>(null);

  useEffect(() => {
    if (account?.isConnected && connection && client) {
      try {
        const newSigner = new ParaSolanaWeb3Signer(client, connection);
        setSigner(newSigner);
      } catch (error) {
        console.error("Failed to initialize Para signer:", error);
        setSigner(null);
      }
    } else {
      setSigner(null);
    }
  }, [account?.isConnected, connection, client]);

  return {
    signer,
    connection,
  };
}