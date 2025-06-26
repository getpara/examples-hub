"use client";

import { useState } from "react";
import { useModal, useWallet, useAccount, useClient, useClaimPregenWallets } from "@getpara/react-sdk";
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
  const para = useClient();

  const [pregenUuid, setPregenUuid] = useState("");
  const [pregenWalletAddress, setPregenWalletAddress] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [pregenError, setPregenError] = useState("");

  const handleGeneratePregenWallet = async () => {
    setIsGenerating(true);
    setPregenError("");
    setPregenUuid("");
    setPregenWalletAddress("");
    setClaimMessage("");
    try {
      const res = await fetch("/api/wallet/generate", { method: "POST" });
      const response = await res.json();
      if (response.success && response.data) {
        setPregenUuid(response.data.uuid);
        setPregenWalletAddress(response.data.wallet.address);
      } else {
        setPregenError(response.error || "Failed to generate wallet");
      }
    } catch (e: any) {
      setPregenError(e.message || "Error generating wallet");
    }
    setIsGenerating(false);
  };

  const handleClaimPregenWallet = async () => {
    setIsClaiming(true);
    setClaimMessage("");
    if (!pregenUuid) {
      setClaimMessage("Please generate a wallet first.");
      setIsClaiming(false);
      return;
    }
    if (!para) {
      setClaimMessage("No Para client set");
      setIsClaiming(false);
      return;
    }
    try {
      //pregen claim requires a user to be authenticated
      if (!account?.isConnected) {
        setClaimMessage("Please authenticate first.");
        setIsClaiming(false);
        return;
      }
      const userEmail = await para?.getEmail();
      if (!userEmail) {
        setClaimMessage("No user email found, please use an email login.");
        setIsClaiming(false);
        return;
      }

      // retrieve the userShare for the pregen wallet from the server
      const retrievalResponse = await fetch(`/api/wallet/${pregenUuid}`);

      const retrievalData = await retrievalResponse.json();

      if (!retrievalData.success) {
        setClaimMessage(retrievalData.error || "Failed to retrieve wallet data.");
        setIsClaiming(false);
        return;
      }

      const { userShare, walletId } = retrievalData;

      if (!userShare) {
        setClaimMessage("No user share found.");
        setIsClaiming(false);
        return;
      }

      await para?.setUserShare(userShare);

      await para.updatePregenWalletIdentifier({
        walletId,
        newPregenId: { email: userEmail },
      });

      await para.claimPregenWallets({
        pregenId: { email: userEmail },
      });

      setClaimMessage("Claim successful! The wallet has been merged into your account.");
    } catch (e: any) {
      setClaimMessage(e.message || "Error while claiming");
    }
    setIsClaiming(false);
  };

  return (
    <>
      <Header isPregenReady={!!pregenUuid} />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] gap-6 p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Para Pregen Wallet Claim</h1>
          <p className="text-gray-600 max-w-md">
            Generate and claim pre-generated wallets using Para SDK
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
          description="Use the Para Modal to authenticate the user that will claim the pre-generated wallet."
          buttonLabel="Open Para Modal"
          disabled={!pregenUuid || isLoading || !!account?.isConnected}
          onClick={openModal}
          isComplete={!!account?.isConnected}
        />
        <StepCard
          stepNumber={3}
          title="Claim Pregen Wallet"
          description="Once authenticated, retrieve the user share and claim the wallet on the client."
          buttonLabel="Claim Wallet"
          disabled={!account?.isConnected || !pregenUuid || isClaiming}
          onClick={handleClaimPregenWallet}
          isComplete={claimMessage.includes("Claim successful")}>
          {claimMessage && (
            <StatusAlert 
              type={claimMessage.includes("successful") ? "success" : "info"}
              message={claimMessage}
              className="mt-2"
            />
          )}
        </StepCard>
          {account?.isConnected && (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Wallet</h3>
              <WalletDisplay walletAddress={wallet?.address} />
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
