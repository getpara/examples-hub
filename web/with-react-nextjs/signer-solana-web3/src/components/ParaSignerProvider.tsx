"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAccount } from "@getpara/react-sdk";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { para } from "@/client/para";
import { Connection } from "@solana/web3.js";

const DEVNET_RPC_URL = process.env.NEXT_PUBLIC_DEVNET_RPC_URL || "https://api.devnet.solana.com/";

interface ParaContextType {
  signer: ParaSolanaWeb3Signer | null;
  connection: Connection | null;
}

const ParaContext = createContext<ParaContextType | undefined>(undefined);

export function ParaSignerProvider({ children }: { children: React.ReactNode }) {
  const { data: account } = useAccount();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [signer, setSigner] = useState<ParaSolanaWeb3Signer | null>(null);

  const initializeSigner = useCallback(() => {
    try {
      const conn = new Connection(DEVNET_RPC_URL, "confirmed");
      setConnection(conn);

      const newSigner = new ParaSolanaWeb3Signer(para, conn);
      setSigner(newSigner);
    } catch (error) {
      console.error("Failed to initialize signer:", error);
      clearSigner();
    }
  }, []);

  const clearSigner = useCallback(() => {
    setSigner(null);
  }, []);

  const checkAuthentication = useCallback(() => {
    if (account?.isConnected) {
      initializeSigner();
    } else {
      clearSigner();
    }
  }, [account, initializeSigner, clearSigner]);

  useEffect(() => {
    checkAuthentication();
    return clearSigner;
  }, [account, checkAuthentication, clearSigner]);

  return (
    <ParaContext.Provider
      value={{
        signer,
        connection,
      }}>
      {children}
    </ParaContext.Provider>
  );
}

export function useParaSigner() {
  const context = useContext(ParaContext);
  if (context === undefined) {
    throw new Error("usePara must be used within a ParaProvider");
  }
  return context;
}
