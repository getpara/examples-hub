"use client";

import { useCallback, useContext, useEffect, useState, createContext } from "react";
import { AuthLayout, OAuthMethod, ParaModal } from "@getpara/react-sdk";
import { ParaAminoSigner, ParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { para } from "@/client/para";
import "@getpara/react-sdk/styles.css";
import { SigningStargateClient } from "@cosmjs/stargate";
import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

const PROVIDER_TESTNET_RPC_URL = process.env.NEXT_PUBLIC_PROVIDERE_TESTNET || "https://cosmos-testnet-rpc.ibs.team/";

interface ParaContextType {
  isConnected: boolean;
  address: string | null;
  walletId: string | null;
  isLoading: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  aminoSigner: ParaAminoSigner | null;
  protoSigner: ParaProtoSigner | null;
  stargateClient: SigningStargateClient | null;
  cosmwasmClient: CosmWasmClient | null;
}

const ParaContext = createContext<ParaContextType | undefined>(undefined);

export function ParaProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aminoSigner, setAminoSigner] = useState<ParaAminoSigner | null>(null);
  const [protoSigner, setProtoSigner] = useState<ParaProtoSigner | null>(null);
  const [stargateClient, setStargateClient] = useState<SigningStargateClient | null>(null);
  const [cosmwasmClient, setCosmwasmClient] = useState<CosmWasmClient | null>(null);

  const initializeCosmjs = async () => {
    const amino = new ParaAminoSigner(para, "cosmos");
    const proto = new ParaProtoSigner(para, "cosmos");
    // You can pass the amino signer to SigningStargateClient and SigningCosmWasmClient as well
    const stargate = await SigningStargateClient.connectWithSigner(PROVIDER_TESTNET_RPC_URL, proto);
    const cosmwasm = await SigningCosmWasmClient.connectWithSigner(PROVIDER_TESTNET_RPC_URL, proto);
    setAminoSigner(amino);
    setProtoSigner(proto);
    setStargateClient(stargate);
    setCosmwasmClient(cosmwasm);
  };

  const clearCosmjs = () => {
    setAminoSigner(null);
    setProtoSigner(null);
    setStargateClient(null);
    setCosmwasmClient(null);
    setAddress(null);
    setWalletId(null);
    setIsConnected(false);
    setError(null);
    setIsLoading(false);
  };

  const checkAuthentication = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      setIsConnected(isAuthenticated);
      if (isAuthenticated) {
        const wallets = Object.values(await para.getWalletsByType("COSMOS"));
        console.log("Wallets:", wallets);
        if (wallets?.length) {
          //secondary address is the cosmos address
          setAddress(wallets[0].addressSecondary || null);
          setWalletId(wallets[0].id || null);
          initializeCosmjs();
        }
      } else {
        clearCosmjs();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
      clearCosmjs();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuthentication();
    return () => {
      clearCosmjs();
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
        aminoSigner,
        protoSigner,
        stargateClient,
        cosmwasmClient,
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
