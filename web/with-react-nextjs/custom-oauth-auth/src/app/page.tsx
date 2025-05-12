"use client";

import { useEffect, useRef, useState } from "react";
import { OAuthButtons } from "@/components/OAuthButtons";
import { WalletDisplay } from "@/components/WalletDisplay";
import { para } from "@/client/para";
import { AuthStateLogin, AuthStateSignup, TOAuthMethod } from "@getpara/web-sdk";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<string>("");
  const [error, setError] = useState<string>("");
  const popupWindow = useRef<Window | null>(null);

  const openPopup = (...args: Parameters<typeof window.open>) => {
    popupWindow.current?.close();
    return (popupWindow.current = window?.open(...args));
  };

  const getFirstWalletAddress = async (): Promise<string> => {
    const wallets = Object.values(await para.getWallets());
    return wallets?.[0]?.address || "unknown";
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      setError("");

      try {
        const isAuthenticated = await para.isFullyLoggedIn();
        setIsConnected(isAuthenticated);

        if (isAuthenticated) {
          setWallet(await getFirstWalletAddress());
        }
      } catch (err: any) {
        setError(err.message || "Authentication check failed");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const handleAuthState = async (authState: AuthStateLogin | AuthStateSignup) => {
    const popupConfig = {
      isCanceled: () => Boolean(popupWindow.current?.closed),
    };

    if (authState.stage === "signup") {
      openPopup(authState.passkeyUrl, "signUpPopup", "popup=true");

      const { walletIds, recoverySecret } = await para.waitForWalletCreation(popupConfig);
      // check if walletids or recoverySecret is null
      if (!walletIds || !recoverySecret) {
        setError("Failed to create wallet");
        return;
      }
    }

    if (authState.stage === "login") {
      openPopup(authState.passkeyUrl, "loginPopup", "popup=true");
      await para.waitForLogin(popupConfig);
    }
  };

  const handleAuthentication = async (method: TOAuthMethod) => {
    setIsLoading(true);
    try {
      switch (method) {
        case "FARCASTER":
          await handleFarcasterAuth();
          break;
        case "TELEGRAM":
          console.error("Telegram authentication is not supported in this example.");
          break;
        default:
          await handleRegularOAuth(method);
          break;
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarcasterAuth = async () => {
    try {
      const popupConfig = {
        onConnectUri: (connectUri: string) => {
          openPopup(connectUri, "farcasterConnectPopup", "popup=true");
        },
        isCanceled: () => Boolean(popupWindow.current?.closed),
      };

      const authState = await para.verifyFarcaster(popupConfig);
      await handleAuthState(authState);
    } catch (error) {
      console.error("Farcaster auth error:", error);
    }
  };

  const handleRegularOAuth = async (method: Exclude<TOAuthMethod, "TELEGRAM" | "FARCASTER">) => {
    try {
      const popupConfig = {
        method,
        onOAuthUrl: (oAuthUrl: string) => {
          openPopup(oAuthUrl, "oAuthPopup", "popup=true");
        },
        isCanceled: () => Boolean(popupWindow.current?.closed),
      };

      const authState = await para.verifyOAuth(popupConfig);
      await handleAuthState(authState);
    } catch (error) {
      console.error("Regular OAuth error:", error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Custom OAuth Auth + Para Example</h1>
      <p className="max-w-md text-center">
        This example demonstrates a minimal custom OAuth authentication flow using Para's SDK in a Next.js (App Router)
        project.
      </p>

      {isConnected ? (
        <WalletDisplay walletAddress={wallet} />
      ) : (
        <OAuthButtons
          onSelect={handleAuthentication}
          isLoading={isLoading}
        />
      )}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </main>
  );
}
