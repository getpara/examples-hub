"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAccount } from "@getpara/react-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v1-integration";
import { createPublicClient, http, LocalAccount, PublicClient, WalletClient } from "viem";
import { para } from "@/client/para";
import { holesky } from "viem/chains";

const HOLESKY_RPC_URL = process.env.NEXT_PUBLIC_HOLESKY_RPC_URL || "https://ethereum-holesky-rpc.publicnode.com";

interface ParaContextType {
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  viemAccount: LocalAccount | null;
}

const ParaContext = createContext<ParaContextType | undefined>(undefined);

export function ParaSignerProvider({ children }: { children: React.ReactNode }) {
  const { data: account } = useAccount();
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [viemAccount, setViemAccount] = useState<LocalAccount | null>(null);

  const initializeViem = () => {
    const paraViemAccount = createParaAccount(para);
    const wallet = createParaViemClient(para, {
      account: paraViemAccount,
      chain: holesky,
      transport: http(HOLESKY_RPC_URL),
    });
    const client = createPublicClient({ chain: holesky, transport: http(HOLESKY_RPC_URL) });
    setWalletClient(wallet);
    setPublicClient(client);
    setViemAccount(paraViemAccount);
  };

  const clearViem = () => {
    setWalletClient(null);
    setPublicClient(null);
  };

  const checkAuthentication = async () => {
    try {
      if (account?.isConnected) {
        initializeViem();
      } else {
        clearViem();
      }
    } catch (err: any) {
      clearViem();
    }
  };

  useEffect(() => {
    checkAuthentication();
    return () => {
      clearViem();
    };
  }, [account]);

  return (
    <ParaContext.Provider
      value={{
        publicClient,
        walletClient,
        viemAccount,
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
