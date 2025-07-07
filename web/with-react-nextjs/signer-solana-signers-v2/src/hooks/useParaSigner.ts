"use client";

import { useEffect, useState } from "react";
import { useAccount, useClient } from "@getpara/react-sdk";
import { createParaSolanaSigner, ParaSolanaSigner } from "@getpara/solana-signers-v2-integration";
import { useSolana } from "./useSolana";

export function useParaSigner() {
  const { data: account } = useAccount();
  const client = useClient();
  const { rpc, rpcUrl } = useSolana();
  const [signer, setSigner] = useState<ParaSolanaSigner | null>(null);

  useEffect(() => {
    if (account?.isConnected && rpc && client) {
      try {
        const newSigner = createParaSolanaSigner({
          para: client as any,
          rpcUrl: rpcUrl,
        });
        
        console.log("Created Para signer with:", {
          address: newSigner.address,
          rpcUrl: rpcUrl
        });
        setSigner(newSigner);
      } catch (error) {
        console.error("Failed to initialize Para signer:", error);
        setSigner(null);
      }
    } else {
      setSigner(null);
    }
  }, [account?.isConnected, rpc, client, rpcUrl]);

  return {
    signer,
    rpc,
  };
}