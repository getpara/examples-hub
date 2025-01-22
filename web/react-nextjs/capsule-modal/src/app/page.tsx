"use client";

import { useEffect, useState } from "react";
import { AuthLayout, CapsuleModal, OAuthMethod } from "@usecapsule/react-sdk";
import { capsule } from "@/client/capsule";
import "@usecapsule/react-sdk/styles.css";
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
      const isAuthenticated = await capsule.isFullyLoggedIn();
      setIsConnected(isAuthenticated);
      if (isAuthenticated) {
        const wallets = Object.values(await capsule.getWallets());
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
      <h1 className="text-2xl font-bold">Capsule + Cosmos Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Capsule Modal with EVM Wallet Connectors in a Next.js
        (App Router) project.
      </p>
      {isConnected ? <WalletDisplay walletAddress={wallet} /> : <p className="text-center">You are not logged in.</p>}
      <button
        disabled={isLoading}
        onClick={handleOpenModal}
        className="rounded-none px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
        Open Capsule Modal
      </button>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <CapsuleModal
        capsule={capsule}
        isOpen={isOpen}
        onClose={handleCloseModal}
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
        appName="Capsule Modal Example"
        logo="/capsule.svg"
        recoverySecretStepEnabled={true}
      />
    </main>
  );
}
