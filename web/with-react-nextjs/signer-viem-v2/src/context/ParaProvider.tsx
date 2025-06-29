"use client";

import { ParaProvider as ParaSDKProvider, Environment } from "@getpara/react-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { createPublicClient, http, type WalletClient, type PublicClient, type LocalAccount } from "viem";
import { holesky } from "viem/chains";
import { API_KEY, ENVIRONMENT, HOLESKY_RPC_URL } from "@/config/constants";
import "@getpara/react-sdk/styles.css";

// Create a custom hook for viem-specific functionality
import { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useClient } from "@getpara/react-sdk";

interface ViemContextType {
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  account: LocalAccount | null;
}

const ViemContext = createContext<ViemContextType | undefined>(undefined);

export function ViemProvider({ children }: { children: React.ReactNode }) {
  const accountQuery = useAccount();
  const para = useClient();
  const isConnected = accountQuery.data?.isConnected ?? false;
  const address = accountQuery.data?.wallets?.[0]?.address as `0x${string}` | undefined;
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [localAccount, setLocalAccount] = useState<LocalAccount | null>(null);

  useEffect(() => {
    if (isConnected && para) {
      const viemAccount = createParaAccount(para);
      const wallet = createParaViemClient(para, { 
        account: viemAccount, 
        chain: holesky, 
        transport: http(HOLESKY_RPC_URL) 
      });
      const client = createPublicClient({ 
        chain: holesky, 
        transport: http(HOLESKY_RPC_URL) 
      });
      
      setLocalAccount(viemAccount);
      setWalletClient(wallet);
      setPublicClient(client);
    } else {
      setLocalAccount(null);
      setWalletClient(null);
      setPublicClient(null);
    }
  }, [isConnected, para]);

  return (
    <ViemContext.Provider value={{ publicClient, walletClient, account: localAccount }}>
      {children}
    </ViemContext.Provider>
  );
}

export function useViem() {
  const context = useContext(ViemContext);
  if (context === undefined) {
    throw new Error("useViem must be used within a ViemProvider");
  }
  return context;
}

export function ParaProvider({ children }: { children: React.ReactNode }) {
  if (!API_KEY) {
    throw new Error("NEXT_PUBLIC_PARA_API_KEY is not set");
  }

  return (
    <ParaSDKProvider
      paraClientConfig={{
        apiKey: API_KEY!,
        env: ENVIRONMENT,
      }}
      config={{ appName: "Para Viem v2 Demo" }}
      paraModalConfig={{
        theme: {
          foregroundColor: "#2D3648",
          backgroundColor: "#FFFFFF",
          accentColor: "#6B7280",
          darkForegroundColor: "#E8EBF2",
          darkBackgroundColor: "#1A1F2B",
          darkAccentColor: "#9CA3AF",
          mode: "light",
          borderRadius: "none",
          font: "Inter",
        },
      }}
    >
      <ViemProvider>
        {children}
      </ViemProvider>
    </ParaSDKProvider>
  );
}