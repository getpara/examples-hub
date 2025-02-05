import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import WebApp from "@twa-dev/sdk";
import { clearChunkedStorage, retrieveChunkedData, storeWithChunking } from "../../lib/cloudStorageUtil";
import para from "../../lib/para";
import { WalletType } from "@getpara/web-sdk";
import { CheckCircle, Shield, Wallet } from "lucide-react";
import { ErrorState } from "../ui/error-state";
import { LoadingState } from "../ui/loading-state";

interface OnboardingScreenProps {
  setScreen: (screen: ScreenName) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ setScreen }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleInitialize();
  }, []);

  const handleInitialize = async () => {
    setIsLoading(true);
    setLoadingMessage("Starting the initialization of Para Telegram Mini App Demo...");
    setError(null);

    try {
      WebApp.ready();

      if (!WebApp.initDataUnsafe.user) {
        setError("Error during initialization: User data not found");
        return;
      }

      const username = WebApp.initDataUnsafe.user?.username;

      if (!username) {
        setError("Error during initialization: Username not found");
        return;
      }

      setLoadingMessage(`User authenticated successfully: ${username}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLoadingMessage(`Checking Telegram cloud storage for existing wallet data associated with user ${username}...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userWalletShare = await retrieveChunkedData("userShare", setLoadingMessage, setError);

      if (userWalletShare) {
        setLoadingMessage("Existing wallet data found. Setting up your wallet...");
        await para.setUserShare(userWalletShare);
        setLoadingMessage("Initialization complete. Redirecting to the app...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setScreen("home");
      } else {
        setLoadingMessage(`No existing wallet data found for user ${username}. Proceeding with new wallet creation...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      setError(
        `Initialization error: ${
          error instanceof Error ? error.message : String(error)
        }. Please try again or contact support if the issue persists.`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setError("Clearing storage and retrying initialization...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      clearChunkedStorage(
        () => {},
        () => {}
      ).catch((error) => {
        console.error("Failed to clear storage:", error);
      });
      para.clearStorage("all");
      para.logout();
      setError("Storage cleared. Retry initialization...");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleCreateWallet = async (): Promise<void> => {
    setIsLoading(true);
    setLoadingMessage("Generating a new wallet...");
    setError(null);
    try {
      const username = WebApp.initDataUnsafe.user?.username;

      if (!username) {
        setError("Error: Username not found. Unable to create wallet.");
        return;
      }

      const pregenIdentifier = `tg:${username}`;

      setLoadingMessage("Creating wallet with pre-generated identifier...");
      const pregenWallet = await para.createPregenWallet({
        type: WalletType.EVM,
        pregenIdentifier,
        pregenIdentifierType: "CUSTOM_ID",
      });

      setLoadingMessage(`Wallet created successfully. Address: ${pregenWallet.address || "N/A"}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLoadingMessage("Retrieving user wallet share...");
      const userWalletShare = (await para.getUserShare()) || "";

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLoadingMessage("Wallet setup complete. Redirecting to the app...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      storeWithChunking("userShare", userWalletShare, setError).catch((error) => {
        console.error("Failed to store wallet data:", error);
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setScreen("home");
    } catch (error) {
      setError(
        `Error: ${error instanceof Error ? error.message : String(error)}. Please try again or contact support.`
      );
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={handleInitialize}
      />
    );
  }

  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  return (
    <div className="h-full flex flex-col justify-between p-6 bg-background animate-fade-in fill-both">
      <div className="fixed top-0 right-0 overflow-hidden w-40 h-40 z-50 pointer-events-none">
        <div className="bg-destructive text-destructive-foreground font-bold py-1 text-center w-52 absolute top-8 right-[-40px] transform rotate-45 shadow-lg">
          Para Demo
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 text-primary transition-all duration-300 hover:scale-105 hover:rotate-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full animate-slide-in-from-top fill-both">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
        </div>

        <div className="text-center space-y-4 mb-8 animate-slide-in-from-bottom delay-1 fill-both">
          <h1 className="text-3xl font-bold text-foreground">Beyond Web3 Authentication</h1>
          <p className="text-lg text-muted-foreground max-w-sm">Cross-app wallets that work everywhere</p>
        </div>

        <div className="w-full max-w-sm space-y-4 animate-slide-in-from-bottom delay-2 fill-both">
          <div className="group bg-secondary/5 border border-secondary/20 rounded-lg p-4 transition-all duration-200 hover:bg-secondary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary/10 text-secondary">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Enterprise Security</h3>
                <p className="text-sm text-muted-foreground">Industry-leading MPC protection</p>
              </div>
            </div>
          </div>

          <div className="group bg-primary/5 border border-primary/20 rounded-lg p-4 transition-all duration-200 hover:bg-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Universal Access</h3>
                <p className="text-sm text-muted-foreground">Cross-app compatibility built in</p>
              </div>
            </div>
          </div>

          <div className="group bg-accent/5 border border-accent/20 rounded-lg p-4 transition-all duration-200 hover:bg-accent/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/10 text-accent">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Start Instantly</h3>
                <p className="text-sm text-muted-foreground">Ready to use in seconds</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-slide-in-from-bottom delay-4 fill-both">
        <Button
          size="lg"
          onClick={handleCreateWallet}
          className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 group">
          <span className="flex items-center gap-2">
            Create Wallet
            <Wallet className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
          </span>
        </Button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
