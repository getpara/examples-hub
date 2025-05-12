"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAccount } from "@getpara/react-sdk";
import { ParaEthersV5Signer } from "@getpara/ethers-v5-integration";
import { ethers } from "ethers";
import { para } from "@/client/para";
import "@getpara/react-sdk/styles.css";

const HOLESKY_RPC_URL = process.env.NEXT_PUBLIC_HOLESKY_RPC_URL || "https://ethereum-holesky-rpc.publicnode.com";

interface ParaContextType {
  signer: ParaEthersV5Signer | null;
  provider: ethers.providers.Provider | null;
}

const ParaContext = createContext<ParaContextType | undefined>(undefined);

export function ParaSignerProvider({ children }: { children: React.ReactNode }) {
  const { data: account } = useAccount();
  const [signer, setSigner] = useState<ParaEthersV5Signer | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(null);

  const initializeEthers = () => {
    const provider = new ethers.providers.JsonRpcProvider(HOLESKY_RPC_URL);
    const signer = new ParaEthersV5Signer(para, provider);
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
  }, [account]);

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
