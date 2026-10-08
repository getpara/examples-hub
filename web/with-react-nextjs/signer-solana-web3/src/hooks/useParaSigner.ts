import { useEffect, useState } from "react";
import { useAccount, useClient } from "@getpara/react-sdk-lite";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { installBrowserBuffer } from "@/lib/installBrowserBuffer";
import { useSolanaConnection } from "@/hooks/useSolanaConnection";

export function useParaSigner() {
  const { isConnected } = useAccount();
  const client = useClient();
  const { connection } = useSolanaConnection();
  const [signer, setSigner] = useState<ParaSolanaWeb3Signer | null>(null);

  useEffect(() => {
    if (isConnected && connection && client) {
      try {
        installBrowserBuffer();
        setSigner(new ParaSolanaWeb3Signer(client, connection));
      } catch (error) {
        console.error("Failed to initialize Para signer:", error);
        setSigner(null);
      }
    } else {
      setSigner(null);
    }
  }, [isConnected, connection, client]);

  return {
    signer,
    connection,
    isReady: Boolean(signer && isConnected),
  };
}
