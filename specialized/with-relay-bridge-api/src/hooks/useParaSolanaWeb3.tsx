import { useState, useCallback, useEffect } from "react";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { Connection } from "@solana/web3.js";
import { useClient, useAccount } from "@getpara/react-sdk";
import { NETWORK_CONFIG, SupportedNetwork } from "@/constants";

interface UseParaSolanaOptions {
  network: SupportedNetwork;
}

interface UseParaSolanaReturn {
  signer: ParaSolanaWeb3Signer | null;
  connection: Connection | null;
  address: string | null;
  isInitialized: boolean;
  initializeClients: () => void;
  clearClients: () => void;
  networkConfig: (typeof NETWORK_CONFIG)[SupportedNetwork];
}

export function useParaSolana(options: UseParaSolanaOptions): UseParaSolanaReturn {
  const { network } = options;
  const para = useClient();
  const { data: account } = useAccount();
  const networkConfig = NETWORK_CONFIG[network];

  const [signer, setSigner] = useState<ParaSolanaWeb3Signer | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const initializeClients = useCallback(async () => {
    if (!para || !account?.isConnected) {
      return;
    }

    if (networkConfig.networkCategory !== "svm") {
      return;
    }

    try {
      const solanaConnection = new Connection(networkConfig.rpcUrl, "confirmed");
      const paraSigner = new ParaSolanaWeb3Signer(para, solanaConnection);

      const publicKey = await paraSigner.sender;

      if (!publicKey) {
        throw new Error("PublicKey is undefined.");
      }

      setConnection(solanaConnection);
      setSigner(paraSigner);
      setAddress(publicKey.toBase58());
    } catch (error) {
      clearClients();
    }
  }, [para, account, network, networkConfig]);

  const clearClients = useCallback(() => {
    setSigner(null);
    setConnection(null);
    setAddress(null);
  }, []);

  useEffect(() => {
    return () => {
      clearClients();
    };
  }, [clearClients]);

  const isInitialized = Boolean(networkConfig.networkCategory === "svm" && signer && connection && address);

  return {
    signer,
    connection,
    address,
    isInitialized,
    initializeClients,
    clearClients,
    networkConfig,
  };
}
