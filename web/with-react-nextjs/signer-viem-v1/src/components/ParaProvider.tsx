"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ParaModal, AuthLayout, OAuthMethod } from "@getpara/react-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v1-integration";
import { createPublicClient, http, LocalAccount, PublicClient, WalletClient } from "viem";
import { para } from "@/client/para";
import "@getpara/react-sdk/styles.css";
import { holesky } from "viem/chains";

const HOLESKY_RPC_URL = process.env.NEXT_PUBLIC_HOLESKY_RPC_URL || "https://ethereum-holesky-rpc.publicnode.com";

interface ParaContextType {
  isConnected: boolean;
  walletId: string | null;
  isLoading: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  address: `0x${string}` | null;
  account: LocalAccount | null;
}

const ParaContext = createContext<ParaContextType | undefined>(undefined);

export function ParaProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [address, setAddress] = useState<`0x${string}` | null>(null);

  const initializeViem = () => {
    const account = createParaAccount(para);
    const wallet = createParaViemClient(para, { account, chain: holesky, transport: http(HOLESKY_RPC_URL) });
    const client = createPublicClient({ chain: holesky, transport: http(HOLESKY_RPC_URL) });
    setWalletClient(wallet);
    setPublicClient(client);
    setAccount(account);
  };

  const clearViem = () => {
    setWalletClient(null);
    setPublicClient(null);
  };

  const checkAuthentication = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      setIsConnected(isAuthenticated);
      if (isAuthenticated) {
        const wallets = Object.values(await para.getWalletsByType("EVM"));
        if (wallets?.length) {
          setAddress(wallets[0].address?.startsWith("0x") ? (wallets[0].address as `0x${string}`) : null);
          setWalletId(wallets[0].id || null);
          initializeViem();
        }
      } else {
        clearViem();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
      clearViem();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuthentication();
    return () => {
      clearViem();
    };
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(async () => {
    await checkAuthentication();
    setIsOpen(false);
  }, []);

  return (
    <ParaContext.Provider
      value={{
        isConnected,
        address,
        walletId,
        isLoading,
        error,
        openModal,
        closeModal,
        publicClient,
        walletClient,
        account,
      }}>
      {children}
      <ParaModal
        para={para}
        isOpen={isOpen}
        onClose={closeModal}
        disableEmailLogin={false}
        disablePhoneLogin={false}
        authLayout={[AuthLayout.AUTH_FULL]}
        oAuthMethods={[
          OAuthMethod.APPLE,
          OAuthMethod.DISCORD,
          OAuthMethod.FACEBOOK,
          OAuthMethod.FARCASTER,
          OAuthMethod.GOOGLE,
          OAuthMethod.TWITTER,
        ]}
        onRampTestMode={true}
        theme={{
          foregroundColor: "#2D3648",
          backgroundColor: "#FFFFFF",
          accentColor: "#0066CC",
          darkForegroundColor: "#E8EBF2",
          darkBackgroundColor: "#1A1F2B",
          darkAccentColor: "#4D9FFF",
          mode: "light",
          borderRadius: "none",
          font: "Inter",
        }}
        appName="Para Modal Example"
        logo="/para.svg"
        recoverySecretStepEnabled={true}
        twoFactorAuthEnabled={false}
      />
    </ParaContext.Provider>
  );
}

export function usePara() {
  const context = useContext(ParaContext);
  if (context === undefined) {
    throw new Error("usePara must be used within a ParaProvider");
  }
  return context;
}
