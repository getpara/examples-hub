"use client";

import { useContext, useEffect, useState, createContext } from "react";
import { useAccount } from "@getpara/react-sdk";
import { ParaAminoSigner, ParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { para } from "@/client/para";
import "@getpara/react-sdk/styles.css";
import { SigningStargateClient } from "@cosmjs/stargate";
import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

const PROVIDER_TESTNET_RPC_URL = process.env.NEXT_PUBLIC_PROVIDERE_TESTNET || "https://cosmos-testnet-rpc.ibs.team/";

interface ParaContextType {
  aminoSigner: ParaAminoSigner | null;
  protoSigner: ParaProtoSigner | null;
  stargateClient: SigningStargateClient | null;
  cosmwasmClient: CosmWasmClient | null;
}

const SignerContext = createContext<ParaContextType | undefined>(undefined);

export function ParaSignerProvider({ children }: { children: React.ReactNode }) {
  const { data: account } = useAccount();
  const [aminoSigner, setAminoSigner] = useState<ParaAminoSigner | null>(null);
  const [protoSigner, setProtoSigner] = useState<ParaProtoSigner | null>(null);
  const [stargateClient, setStargateClient] = useState<SigningStargateClient | null>(null);
  const [cosmwasmClient, setCosmwasmClient] = useState<CosmWasmClient | null>(null);

  const initializeCosmjs = async () => {
    const amino = new ParaAminoSigner(para, "cosmos");
    const proto = new ParaProtoSigner(para, "cosmos");
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
  };

  const checkAuthentication = async () => {
    try {
      if (account?.isConnected) {
        initializeCosmjs();
      } else {
        clearCosmjs();
      }
    } catch (err: any) {
      clearCosmjs();
    }
  };

  useEffect(() => {
    checkAuthentication();
    return () => {
      clearCosmjs();
    };
  }, []);

  return (
    <SignerContext.Provider
      value={{
        aminoSigner,
        protoSigner,
        stargateClient,
        cosmwasmClient,
      }}>
      {children}
    </SignerContext.Provider>
  );
}

export function useParaSigner() {
  const context = useContext(SignerContext);
  if (context === undefined) {
    throw new Error("usePara must be used within a ParaProvider");
  }
  return context;
}
