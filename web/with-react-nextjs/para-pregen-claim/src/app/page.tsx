"use client";

import { useEffect, useState } from "react";
import { AuthLayout, ParaModal } from "@getpara/react-sdk";
import { para } from "@/client/para";
import "@getpara/react-sdk/styles.css";
import { WalletDisplay } from "@/components/WalletDisplay";
import { StepCard } from "@/components/StepCard";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");

  const [pregenUuid, setPregenUuid] = useState("");
  const [pregenWalletAddress, setPregenWalletAddress] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");

  const handleCheckIfAuthenticated = async () => {
    setError("");
    setIsLoading(true);
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
    const initialize = async () => {
      await para.logout();
      handleCheckIfAuthenticated();
    };
    initialize();
  }, []);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = async () => {
    handleCheckIfAuthenticated();
    setIsOpen(false);
  };

  const handleGeneratePregenWallet = async () => {
    setIsGenerating(true);
    setError("");
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
        setError(data.error || "Failed to generate wallet");
      }
    } catch (e: any) {
      setError(e.message || "Error generating wallet");
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
    try {
      //pregen claim requires a user to be authenticated
      if (!isConnected) {
        setClaimMessage("Please authenticate first.");
        setIsClaiming(false);
        return;
      }
      const userEmail = await para.getEmail();
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

      await para.setUserShare(userShare);

      await para.updatePregenWalletIdentifier({
        walletId,
        newPregenIdentifier: userEmail,
        newPregenIdentifierType: "EMAIL",
      });

      await para.claimPregenWallets({
        pregenIdentifier: userEmail,
        pregenIdentifierType: "EMAIL",
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
          disabled={isGenerating || isConnected}
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
          disabled={!pregenUuid || isLoading || isConnected}
          onClick={handleOpenModal}
          isComplete={isConnected}
        />
        <StepCard
          stepNumber={3}
          title="Claim Pregen Wallet"
          description="Once authenticated, retrieve the user share and claim the wallet on the client."
          buttonLabel="Claim Wallet"
          disabled={!isConnected || !pregenUuid || isClaiming}
          onClick={handleClaimPregenWallet}
          isComplete={claimMessage.includes("Claim successful")}>
          {claimMessage && <p className="text-sm mt-2">{claimMessage}</p>}
        </StepCard>
        <div className="mt-6">{isConnected ? <WalletDisplay walletAddress={wallet} /> : null}</div>
      </div>
      {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
      <ParaModal
        para={para}
        isOpen={isOpen}
        onClose={handleCloseModal}
        disableEmailLogin={false}
        disablePhoneLogin={true}
        authLayout={[AuthLayout.AUTH_FULL]}
        oAuthMethods={[]}
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
        appName="Para Pregen Claim"
        logo="/para.svg"
        recoverySecretStepEnabled={true}
        twoFactorAuthEnabled={false}
      />
    </main>
  );
}
