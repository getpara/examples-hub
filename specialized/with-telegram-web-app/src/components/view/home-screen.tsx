import React, { useEffect, useState } from "react";
import { NavigationDrawer } from "../ui/navigation-drawer";
import { WalletCard } from "../ui/wallet-card";
import { DeveloperPortalCard } from "../ui/developer-portal-card";
import QRCodeModal from "../ui/qr-code-modal";
import WebApp from "@twa-dev/sdk";
import { ethers } from "ethers";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import para from "../../lib/para";
import { ErrorState } from "../ui/error-state";
import { LoadingState } from "../ui/loading-state";
import WalletDetailsModal from "../ui/wallet-details-modal";

interface HomeScreenProps {
  setScreen: (screen: ScreenName) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ setScreen }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [username] = useState<string>(WebApp.initDataUnsafe.user?.username || "");
  const [portfolioValue, setPortfolioValue] = useState<string>("0");
  const [profileImage] = useState<string>(WebApp.initDataUnsafe.user?.photo_url || "");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const [error, setError] = useState<string>("");

  const [showWalletDetails, setShowWalletDetails] = useState<boolean>(false);
  const [walletDetails, setWalletDetails] = useState<any>(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const paraEthersSigner = new ParaEthersSigner(para, provider);

    setIsLoading(true);
    setLoadingMessage("Loading wallet balance...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const address = await paraEthersSigner.getAddress();
      if (!address) {
        setError("Failed to fetch address.");
        return;
      }
      setAddress(address);
      const balance = await provider.getBalance(address);
      setPortfolioValue(ethers.formatEther(balance));
    } catch (error) {
      setError("Failed to fetch balance");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleWalletDetailsClick = async () => {
    try {
      const details = await para.getWallets();
      setWalletDetails(details);
      setShowWalletDetails(true);
    } catch (error) {
      setError("Failed to fetch wallet details");
    }
  };

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={fetchBalance}
      />
    );
  }

  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  return (
    <div className="h-full flex flex-col bg-background animate-fade-in fill-both">
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-background/80 animate-slide-in-from-top fill-both">
        <img
          src="https://cdn.prod.website-files.com/66cce496e60dab6365fdce5c/66ce42f5ac97176fb8287818_OG%20Logo%20Full.svg"
          alt="Logo"
          className="h-6 w-auto animate-fade-in delay-1 fill-both"
        />
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          setScreen={setScreen}
        />
      </div>

      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto scroll-smooth">
        <div className="animate-slide-in-from-bottom delay-2 fill-both">
          <WalletCard
            username={username}
            walletAddress={address}
            portfolioValue={portfolioValue}
            profileImage={profileImage}
            onReceiveClick={() => setShowQR(true)}
            onSendClick={() => setScreen("transaction")}
            onWalletDetailsClick={handleWalletDetailsClick}
          />
        </div>

        <div className="animate-slide-in-from-bottom delay-3 fill-both">
          <DeveloperPortalCard onPortalClick={() => window.open("https://developer.getpara.com", "_blank")} />
        </div>
      </div>
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        address={address}
      />

      <WalletDetailsModal
        isOpen={showWalletDetails}
        onClose={() => setShowWalletDetails(false)}
        walletDetails={walletDetails}
      />
    </div>
  );
};

export default HomeScreen;
