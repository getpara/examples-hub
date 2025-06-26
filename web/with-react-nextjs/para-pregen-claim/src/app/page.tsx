"use client";

import { useState } from "react";
import { useModal, useWallet, useAccount } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { WalletDisplay } from "@/components/ui/WalletDisplay";
import { StepCard } from "@/components/ui/StepCard";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { Header } from "@/components/layout/Header";

export default function Home() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { data: account, isLoading, error } = useAccount();

  const [pregenUuid, setPregenUuid] = useState("");
  const [pregenWalletAddress, setPregenWalletAddress] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pregenError, setPregenError] = useState("");

  const handleGeneratePregenWallet = async () => {
    setIsGenerating(true);
    setPregenError("");
    setPregenUuid("");
    setPregenWalletAddress("");
    try {
      const res = await fetch("/api/wallet/generate", { method: "POST" });
      const response = await res.json();
      if (response.success) {
        setPregenUuid(response.uuid);
        setPregenWalletAddress(response.wallet.address);
        // Store UUID in localStorage for fetchPregenWalletsOverride
        localStorage.setItem('pregenUuid', response.uuid);
      } else {
        setPregenError(response.error || "Failed to generate wallet");
      }
    } catch (e: any) {
      setPregenError(e.message || "Error generating wallet");
    }
    setIsGenerating(false);
  };


  return (
    <>
      <Header isPregenReady={!!pregenUuid} />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] gap-6 p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Para Pregen Wallet Claim</h1>
          <p className="text-gray-600 max-w-md">
            Generate a wallet server-side, then sign in to automatically claim it as your primary wallet
          </p>
        </div>
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <StepCard
          stepNumber={1}
          title="Generate Pregen Wallet"
          description="Create a new wallet on the server and store its user share. This is a pre-generated wallet."
          buttonLabel={isGenerating ? "Generating..." : "Generate Wallet"}
          disabled={isGenerating || !!account?.isConnected}
          onClick={handleGeneratePregenWallet}
          isComplete={!!pregenUuid}>
          {pregenUuid && (
            <div className="text-sm mt-2">
              <p>UUID: {pregenUuid}</p>
              <p>Address: {pregenWalletAddress}</p>
            </div>
          )}
        </StepCard>
        <StepCard
          stepNumber={2}
          title="Authenticate with Para"
          description="Sign in with Para to automatically claim your pre-generated wallet."
          buttonLabel="Open Para Modal"
          disabled={!pregenUuid || isLoading || !!account?.isConnected}
          onClick={openModal}
          isComplete={!!account?.isConnected}
        />
          {account?.isConnected && (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Claimed Wallet</h3>
              <WalletDisplay walletAddress={wallet?.address} />
              {pregenUuid && (
                <StatusAlert 
                  type="success"
                  message="Pre-generated wallet successfully claimed!"
                  className="mt-4"
                />
              )}
            </Card>
          )}
        </div>
        {(error?.message || !!pregenError) && (
          <StatusAlert 
            type="error" 
            message={error?.message || pregenError}
            className="max-w-2xl mt-4"
          />
        )}
      </main>
    </>
  );
}
