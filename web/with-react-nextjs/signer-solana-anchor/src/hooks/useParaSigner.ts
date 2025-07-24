"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useClient } from "@getpara/react-sdk";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useSolana } from "./useSolana";

export function useParaSigner() {
  const { isConnected } = useAccount();
  const client = useClient();
  const { connection } = useSolana();
  
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
        signMessage: async (message: Uint8Array): Promise<Uint8Array> => {
          return await signer.signBytes(Buffer.from(message));
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
        signMessage: async (_: Uint8Array): Promise<Uint8Array> => {
          throw new Error("Read-only provider: Authenticate to sign messages.");
        },
      };
    }
  }, []);

  useEffect(() => {
    if (isConnected && connection && client) {
      try {
        const newSigner = new ParaSolanaWeb3Signer(client, connection);
        setSigner(newSigner);

        const wallet = createWalletAdapter(newSigner);
        const provider = new anchor.AnchorProvider(
          connection, 
          wallet, 
          { commitment: connection.commitment || "confirmed" }
        );

        setAnchorProvider(provider);
      } catch (error) {
        console.error("Failed to initialize signer:", error);
        setSigner(null);
        setAnchorProvider(null);
      }
    } else {
      setSigner(null);
      setAnchorProvider(null);
    }
  }, [isConnected, connection, client, createWalletAdapter]);

  return {
    signer,
    connection,
    anchorProvider,
    isConnected: isConnected || false,
    address: signer?.sender?.toBase58() || null,
  };
}