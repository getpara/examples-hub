"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ParaModal, AuthLayout, OAuthMethod } from "@getpara/react-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ethers } from "ethers";
import { para } from "@/client/para";
import "@getpara/react-sdk/styles.css";

const HOLESKY_RPC_URL = process.env.NEXT_PUBLIC_HOLESKY_RPC_URL || "https://ethereum-holesky-rpc.publicnode.com";

interface ParaContextType {
  isConnected: boolean;
  address: string | null;
  walletId: string | null;
  isLoading: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  signer: ParaEthersSigner | null;
  provider: ethers.JsonRpcProvider | null;
}

const ParaContext = createContext<ParaContextType | undefined>(undefined);

export function ParaProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setIsLoading(true);
    setError(null);
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      setIsConnected(isAuthenticated);
      if (isAuthenticated) {
        const wallets = Object.values(await para.getWallets());
        if (wallets?.length) {
          setAddress(wallets[0].address || null);
          setWalletId(wallets[0].id || null);
          initializeEthers();
        }
      } else {
        clearEthers();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
      clearEthers();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuthentication();
    // Cleanup function to clear ethers instances when component unmounts
    return () => {
      clearEthers();
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
        signer,
        provider,
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
