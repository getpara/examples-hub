"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAccount } from "@getpara/react-sdk";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { para } from "@/client/para";
import { SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

const DEVNET_RPC_URL = process.env.NEXT_PUBLIC_DEVNET_RPC_URL || "https://api.devnet.solana.com/";

interface ParaContextType {
  signer: ParaSolanaWeb3Signer | null;
  connection: anchor.web3.Connection | null;
  anchorProvider: anchor.AnchorProvider | null;
}

const ParaContext = createContext<ParaContextType | undefined>(undefined);

export function ParaSignerProvider({ children }: { children: React.ReactNode }) {
  const { data: account } = useAccount();

  const [connection, setConnection] = useState<anchor.web3.Connection | null>(null);
  const [signer, setSigner] = useState<ParaSolanaWeb3Signer | null>(null);
  const [anchorProvider, setAnchorProvider] = useState<anchor.AnchorProvider | null>(null);

  const createWalletAdapter = useCallback((signer: ParaSolanaWeb3Signer | null) => {
    if (signer && signer.sender) {
      return {
        publicKey: signer.sender,
        signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
          return await signer.signTransaction(tx);
        },
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
          return await Promise.all(txs.map((tx) => signer.signTransaction(tx)));
        },
      };
    } else {
      return {
        publicKey: SystemProgram.programId,
        signTransaction: async <T extends Transaction | VersionedTransaction>(_: T): Promise<T> => {
          throw new Error("Read-only provider: Authenticate to sign transactions.");
        },
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(_: T[]): Promise<T[]> => {
          throw new Error("Read-only provider: Authenticate to sign transactions.");
        },
      };
    }
  }, []);

  const initializeSigner = useCallback(() => {
    try {
      const conn = new anchor.web3.Connection(DEVNET_RPC_URL, "confirmed");
      setConnection(conn);

      const newSigner = new ParaSolanaWeb3Signer(para, conn);
      setSigner(newSigner);

      const wallet = createWalletAdapter(newSigner);

      const provider = new anchor.AnchorProvider(conn, wallet, { commitment: conn.commitment || "confirmed" });

      setAnchorProvider(provider);
    } catch (error) {
      console.error("Failed to initialize signer:", error);
      clearSigner();
    }
  }, [para, createWalletAdapter]);

  const clearSigner = useCallback(() => {
    setSigner(null);
    setAnchorProvider(null);
  }, []);

  const checkAuthentication = useCallback(() => {
    if (account?.isConnected) {
      initializeSigner();
    } else {
      clearSigner();
    }
  }, [account, initializeSigner, clearSigner]);

  useEffect(() => {
    checkAuthentication();
    return clearSigner;
  }, [account, checkAuthentication, clearSigner]);

  return (
    <ParaContext.Provider
      value={{
        signer,
        connection,
        anchorProvider,
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
