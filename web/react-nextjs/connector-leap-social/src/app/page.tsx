"use client";

import { useEffect, useState } from "react";
import { capsule } from "@/client/capsule";
import { WalletDisplay } from "@/components/WalletDisplay";
import { CustomCapsuleModalView } from "@leapwallet/cosmos-social-login-capsule-provider-ui";
import { OAuthMethod } from "@usecapsule/web-sdk";
import "@leapwallet/cosmos-social-login-capsule-provider-ui/styles.css";

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

  const handleLoginSuccess = async () => {
    setIsOpen(false);
    await handleCheckIfAuthenticated();
  };

  const handleLoginFailure = () => {
    setIsOpen(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Capsule Modal + Cosmos Wallets Example</h1>
      <p className="max-w-md text-center">
        This minimal example demonstrates how to integrate the Capsule Modal with Cosmos Wallet Connectors in a Next.js
        (App Router) project.
      </p>
      {isConnected ? <WalletDisplay walletAddress={wallet} /> : <p className="text-center">You are not logged in.</p>}
      <button
        disabled={isLoading}
        onClick={handleOpenModal}
        className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950">
        Open Capsule Modal
      </button>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <div className="leap-ui">
        <CustomCapsuleModalView
          capsule={capsule as any}
          showCapsuleModal={isOpen}
          setShowCapsuleModal={setIsOpen}
          theme="light"
          onAfterLoginSuccessful={handleLoginSuccess}
          onLoginFailure={handleLoginFailure}
          oAuthMethods={[
            OAuthMethod.APPLE,
            OAuthMethod.DISCORD,
            OAuthMethod.FACEBOOK,
            OAuthMethod.GOOGLE,
            OAuthMethod.TWITTER,
          ]}
          disableEmailLogin={false}
        />
      </div>
    </main>
  );
}
