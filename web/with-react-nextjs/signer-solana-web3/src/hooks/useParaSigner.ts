"use client";

import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { useAccount, useClient } from "@getpara/react-sdk-lite";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { useSolana } from "./useSolana";

function installBrowserBuffer() {
  if (typeof globalThis !== "undefined" && !("Buffer" in globalThis)) {
    (globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;
  }
}

export function useParaSigner() {
  const { isConnected } = useAccount();
  const client = useClient();
  const { connection } = useSolana();
  const [signer, setSigner] = useState<ParaSolanaWeb3Signer | null>(null);

  useEffect(() => {
    if (isConnected && connection && client) {
      try {
        installBrowserBuffer();
        const newSigner = new ParaSolanaWeb3Signer(client, connection);
        setSigner(newSigner);
      } catch (error) {
        console.error("Failed to initialize Para signer:", error);
        setSigner(null);
      }
    } else {
      setSigner(null);
    }
  }, [isConnected, connection, client]);

  const isReady = Boolean(signer && isConnected);
  const address = signer?.sender?.toBase58() ?? null;

  return {
    signer,
    connection,
    isReady,
    address,
  };
}
