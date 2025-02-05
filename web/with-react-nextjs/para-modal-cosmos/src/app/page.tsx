"use client";

import { useEffect, useState } from "react";
import { AuthLayout, ParaModal, ExternalWallet } from "@getpara/react-sdk";
import { para } from "@/client/para";
import "@getpara/react-sdk/styles.css";
import { WalletDisplay } from "@/components/WalletDisplay";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wallet, setWallet] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleCheckIfAuthenticated = async () => {
    setIsLoading(true);
    setError("");
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      setIsConnected(isAuthenticated);
      if (isAuthenticated) {
        const wallets = Object.values(await para.getWallets());
        if (wallets?.length) {
          setWallet(wallets[0].address || "unknown");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleCheckIfAuthenticated();
  }, []);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = async () => {
    handleCheckIfAuthenticated();
    setIsOpen(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para Modal + Cosmos Wallets Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Para Modal with Cosmos Wallet Connectors in a Next.js
        (App Router) project.
      </p>
      {isConnected ? <WalletDisplay walletAddress={wallet} /> : <p className="text-center">You are not logged in.</p>}
      <button
        disabled={isLoading}
        onClick={handleOpenModal}
        className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950">
        Open Para Modal
      </button>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <ParaModal
        para={para}
        isOpen={isOpen}
        onClose={handleCloseModal}
        disableEmailLogin={true}
        disablePhoneLogin={true}
        authLayout={[AuthLayout.EXTERNAL_FULL]}
        externalWallets={[ExternalWallet.KEPLR, ExternalWallet.LEAP]}
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
        appName="Para Modal + Cosmos Wallets Example"
        logo="/para.svg"
        recoverySecretStepEnabled={true}
        twoFactorAuthEnabled={false}
      />
    </main>
  );
}
