"use client";

import { useEffect, useState } from "react";
import { useAccount, useClient } from "@getpara/react-sdk";
import { createParaSolanaSigner, ParaSolanaSigner } from "@getpara/solana-signers-v2-integration";
import { useSolana } from "./useSolana";

export function useParaSigner() {
  const account = useAccount();
  const client = useClient();
  const { rpc, paraRpc } = useSolana();
  const [signer, setSigner] = useState<ParaSolanaSigner | null>(null);

  useEffect(() => {
    if (account?.isConnected && rpc && client) {
      try {
        const newSigner = createParaSolanaSigner({
          para: client as any,
          rpc: paraRpc, // Pass the Para-compatible RPC client instance
        });
        
        setSigner(newSigner);
      } catch (error) {
        console.error("Failed to initialize Para signer:", error);
        setSigner(null);
      }
    } else {
      setSigner(null);
    }
  }, [account?.isConnected, rpc, client, paraRpc]);

  return {
    signer,
    rpc,
  };
}
