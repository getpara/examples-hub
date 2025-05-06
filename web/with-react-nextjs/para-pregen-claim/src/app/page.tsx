"use client";

import { useState } from "react";
import { useModal, useWallet, useAccount, useClient } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { WalletDisplay } from "@/components/WalletDisplay";
import { StepCard } from "@/components/StepCard";

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
      const res = await fetch("/api/wallet/generate");
      const data = await res.json();
      if (data.success) {
        setPregenUuid(data.uuid);
        setPregenWalletAddress(data.wallet.address);
      } else {
        setPregenError(data.error || "Failed to generate wallet");
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
      const retrievalResponse = await fetch(`/api/wallet/retrieve?uuid=${pregenUuid}`);

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
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Para Pregen Wallet Claim Demo</h1>
      <p className="max-w-md text-center">
        A demonstration of generating and claiming pre-generated wallets using Para.
      </p>
      <div className="w-full flex flex-col items-center gap-6 mt-6">
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
          {claimMessage && <p className="text-sm mt-2">{claimMessage}</p>}
        </StepCard>
        <div className="mt-6">{account?.isConnected ? <WalletDisplay walletAddress={wallet?.address} /> : null}</div>
      </div>
      {(error?.message || !!pregenError) && (
        <p className="text-red-500 text-sm text-center mt-4">{error?.message || pregenError}</p>
      )}
    </main>
  );
}
