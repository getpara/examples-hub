import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { para } from "../client/para";
import "@getpara/react-sdk/styles.css";
import { provider } from "../client/ethers";

interface ParaSignerContextType {
  signer: ParaEthersSigner | null;
}

const ParaSignerContext = createContext<ParaSignerContextType | undefined>(
  undefined
);

export function ParaSignerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: account } = useAccount();
  const [signer, setSigner] = useState<ParaEthersSigner | null>(null);

  useEffect(() => {
    if (account?.isConnected) {
      initializeEthers();
    } else {
      clearEthers();
    }
  }, [account?.isConnected]);

  const initializeEthers = () => {
    const signer = new ParaEthersSigner(para, provider);
    setSigner(signer);
  };

  const clearEthers = () => {
    setSigner(null);
  };

  return (
    <ParaSignerContext.Provider
      value={{
        signer,
      }}
    >
      {children}
    </ParaSignerContext.Provider>
  );
}

export function useParaSigner() {
  const context = useContext(ParaSignerContext);
  if (context === undefined) {
    throw new Error("useParaSigner must be used within a ParaSignerProvider");
  }
  return context;
}
