"use client";

import { useEffect, useRef, useState } from "react";
import { OAuthButtons } from "@/components/OAuthButtons";
import { WalletDisplay } from "@/components/WalletDisplay";
import { para } from "@/client/para";
import { OAuthMethod, AuthStateLogin, AuthStateSignup } from "@getpara/web-sdk";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<string>("");
  const [error, setError] = useState<string>("");
  const popupWindow = useRef<Window | null>(null);

  const openPopup = (...args: Parameters<typeof window.open>) => {
    if (popupWindow.current) {
      popupWindow.current.close();
    }

    popupWindow.current = window?.open(...args);

    return popupWindow.current;
  }

  const handleAuthState = async (authState: AuthStateLogin | AuthStateSignup) => {
    switch (authState.stage) {
      case 'signup': {
        openPopup(authState.passkeyUrl, "signUpPopup", "popup=true");

        const { needsWallet } = await para.waitForWalletCreation({
          isCanceled: () => popupWindow.current?.closed,
        });

        if (needsWallet) {
          await para.createWallet();
        }
      }
      break;

      case 'login': {
        openPopup(authState.passkeyUrl, "loginPopup", "popup=true");

        await para.waitForLogin({
          isCanceled: () => popupWindow.current?.closed,
        });
      }
      break;
    }
  }

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

  const handleAuthentication = async (method: OAuthMethod) => {
    setIsLoading(true);
    try {
      if (method === OAuthMethod.FARCASTER) {
        await handleFarcasterAuth();
      } else {
        await handleRegularOAuth(method);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarcasterAuth = async () => {
    try { 
      const authState = await para.verifyFarcaster({
        onConnectUri: connectUri => {
          openPopup(connectUri, "farcasterConnectPopup", "popup=true");
        },
        isCanceled: () => popupWindow.current?.closed,
      });

      handleAuthState(authState);

    } catch (e) {
      console.error("Farcaster auth error:", e);
    }
  };

  const handleRegularOAuth = async (method: OAuthMethod) => {
    try { 
      const authState = await para.verifyOAuth({
        onOAuthUrl: oAuthUrl => {
          openPopup(oAuthUrl, "oAuthPopup", "popup=true");
        },
        isCanceled: () => popupWindow.current?.closed,
      });

      handleAuthState(authState);
    } catch (e) {
      console.error("Regular OAuth error:", e);
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
