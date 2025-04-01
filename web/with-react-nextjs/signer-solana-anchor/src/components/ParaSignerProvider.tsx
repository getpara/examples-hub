import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "@getpara/react-sdk";
import { para } from "../client/para";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { connection } from "@/client/solana";

interface ParaSignerContextType {
  signer: ParaSolanaWeb3Signer | null;
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
  const [signer, setSigner] = useState<ParaSolanaWeb3Signer | null>(null);

  useEffect(() => {
    if (account?.isConnected) {
      initializeSolanaWeb3();
    } else {
      clearSolanaWeb3();
    }
  }, [account?.isConnected]);

  const initializeSolanaWeb3 = () => {
    const signer = new ParaSolanaWeb3Signer(para, connection);
    setSigner(signer);
  };

  const clearSolanaWeb3 = () => {
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
