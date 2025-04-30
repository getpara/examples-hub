"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ParaModal, AuthLayout, OAuthMethod } from "@getpara/react-sdk";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { para } from "@/client/para";
import "@getpara/react-sdk/styles.css";
import { Connection, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

const DEVNET_RPC_URL = process.env.NEXT_PUBLIC_DEVNET_RPC_URL || "https://api.devnet.solana.com/";

interface ParaContextType {
  isConnected: boolean;
  address: string | null;
  walletId: string | null;
  isLoading: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  signer: ParaSolanaWeb3Signer | null;
  connection: Connection | null;
  anchorProvider: anchor.AnchorProvider | null;
}

const ParaContext = createContext<ParaContextType | undefined>(undefined);

export function ParaProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signer, setSigner] = useState<ParaSolanaWeb3Signer | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [anchorProvider, setAnchorProvider] = useState<anchor.AnchorProvider | null>(null);

  useEffect(() => {
    const conn = new Connection(DEVNET_RPC_URL, "confirmed");
    setConnection(conn);
  }, []);

  useEffect(() => {
    if (connection) {
      if (signer && signer.sender) {
        const signingWallet = {
          publicKey: signer.sender,
          signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
            return await signer.signTransaction(tx);
          },
          signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
            return await Promise.all(txs.map((tx) => signer.signTransaction(tx)));
          },
        };
        const provider = new anchor.AnchorProvider(connection, signingWallet, {
          commitment: connection.commitment || "confirmed",
        });
        setAnchorProvider(provider);
      } else {
        const readOnlyWallet = {
          publicKey: SystemProgram.programId, // Fallback to SystemProgram's public key for read-only access
          signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
            throw new Error("Read-only provider: Authenticate to sign transactions.");
          },
          signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
            throw new Error("Read-only provider: Authenticate to sign transactions.");
          },
        };
        const provider = new anchor.AnchorProvider(connection, readOnlyWallet, {
          commitment: connection.commitment || "confirmed",
        });
        setAnchorProvider(provider);
      }
    } else {
      setAnchorProvider(null);
    }
  }, [connection, signer]);

  const initializeSigner = () => {
    if (connection) {
      const paraSigner = new ParaSolanaWeb3Signer(para, connection);
      setSigner(paraSigner);
    } else {
      setError("Failed to initialize signer: Connection not ready.");
      console.error("Cannot initialize signer: Connection not available.");
    }
  };

  const clearSigner = () => {
    setSigner(null);
  };

  const checkAuthentication = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      setIsConnected(isAuthenticated);
      if (isAuthenticated) {
        const wallets = await para.getWalletsByType("SOLANA");
        if (wallets.length > 0 && wallets[0].address) {
          setAddress(wallets[0].address);
          setWalletId(wallets[0].id || null);
          initializeSigner(); // Initialize signer now that we are authenticated and have wallet info
        } else {
          // Authenticated but no SOLANA wallet found
          setAddress(null);
          setWalletId(null);
          clearSigner(); // Ensure signer is cleared if no wallet
          setError("Authenticated, but no Solana wallet found in Para account.");
        }
      } else {
        // Not authenticated
        setAddress(null);
        setWalletId(null);
        clearSigner(); // Clear signer on logout/not authenticated
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
      setIsConnected(false);
      setAddress(null);
      setWalletId(null);
      clearSigner(); // Clear signer on error
    }
    setIsLoading(false);
  }, [connection]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModalCallback = useCallback(async () => {
    setIsOpen(false);
    await checkAuthentication();
  }, [checkAuthentication]);

  return (
    <ParaContext.Provider
      value={{
        isConnected,
        address,
        walletId,
        isLoading,
        error,
        openModal,
        closeModal: closeModalCallback,
        signer,
        connection,
        anchorProvider,
      }}>
      {children}
      <ParaModal
        para={para}
        isOpen={isOpen}
        onClose={closeModalCallback}
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
