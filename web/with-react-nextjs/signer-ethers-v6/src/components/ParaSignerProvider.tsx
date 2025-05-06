"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAccount } from "@getpara/react-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";
import { para } from "@/client/para";

const HOLESKY_RPC_URL = process.env.NEXT_PUBLIC_HOLESKY_RPC_URL || "https://ethereum-holesky-rpc.publicnode.com";

interface ParaContextType {
  signer: ParaEthersSigner | null;
  provider: ethers.JsonRpcProvider | null;
}

const ParaContext = createContext<ParaContextType | undefined>(undefined);

export function ParaSignerProvider({ children }: { children: React.ReactNode }) {
  const { data: account } = useAccount();
  const [signer, setSigner] = useState<ParaEthersSigner | null>(null);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);

  const initializeEthers = () => {
    const provider = new ethers.JsonRpcProvider(HOLESKY_RPC_URL);
    const signer = new ParaEthersSigner(para, provider);
    setProvider(provider);
    setSigner(signer);
  };

  const clearEthers = () => {
    setProvider(null);
    setSigner(null);
  };

  const checkAuthentication = async () => {
    try {
      if (account?.isConnected) {
        initializeEthers();
      } else {
        clearEthers();
      }
    } catch (err: any) {
      clearEthers();
    }
  };

  useEffect(() => {
    checkAuthentication();
    return () => {
      clearEthers();
    };
  }, []);

  return (
    <ParaContext.Provider
      value={{
        signer,
        provider,
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
