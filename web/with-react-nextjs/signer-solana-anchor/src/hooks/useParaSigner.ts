import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { useAccount, useClient } from "@getpara/react-sdk-lite";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useSolanaConnection } from "@/hooks/useSolanaConnection";
import { installBrowserBuffer } from "@/lib/installBrowserBuffer";

function createWalletAdapter(signer: ParaSolanaWeb3Signer) {
  if (signer.sender) {
    return {
      publicKey: signer.sender,
      signTransaction: async <T extends web3.Transaction | web3.VersionedTransaction>(tx: T): Promise<T> => {
        return await signer.signTransaction(tx);
      },
      signAllTransactions: async <T extends web3.Transaction | web3.VersionedTransaction>(txs: T[]): Promise<T[]> => {
        return await Promise.all(txs.map((tx) => signer.signTransaction(tx)));
      },
      signMessage: async (message: Uint8Array): Promise<Uint8Array> => {
        return await signer.signBytes(Buffer.from(message));
      },
    };
  }

  return {
    publicKey: web3.SystemProgram.programId,
    signTransaction: async <T extends web3.Transaction | web3.VersionedTransaction>(_: T): Promise<T> => {
      throw new Error("Read-only provider: Authenticate to sign transactions.");
    },
    signAllTransactions: async <T extends web3.Transaction | web3.VersionedTransaction>(_: T[]): Promise<T[]> => {
      throw new Error("Read-only provider: Authenticate to sign transactions.");
    },
    signMessage: async (_: Uint8Array): Promise<Uint8Array> => {
      throw new Error("Read-only provider: Authenticate to sign messages.");
    },
  };
}

export function useParaSigner() {
  const { isConnected } = useAccount();
  const client = useClient();
  const { connection } = useSolanaConnection();

  const [signer, setSigner] = useState<ParaSolanaWeb3Signer | null>(null);
  const [anchorProvider, setAnchorProvider] = useState<anchor.AnchorProvider | null>(null);

  useEffect(() => {
    if (isConnected && connection && client) {
      try {
        installBrowserBuffer();
        const newSigner = new ParaSolanaWeb3Signer(client, connection);
        setSigner(newSigner);

        const provider = new anchor.AnchorProvider(connection, createWalletAdapter(newSigner), {
          commitment: connection.commitment || "confirmed",
        });

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
  }, [isConnected, connection, client]);

  const isReady = Boolean(signer && anchorProvider && connection && isConnected);

  return {
    signer,
    connection,
    anchorProvider,
    isConnected: isConnected || false,
    isReady,
    address: signer?.sender?.toBase58() || null,
  };
}
