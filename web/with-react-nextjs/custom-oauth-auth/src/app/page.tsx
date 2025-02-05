"use client";

import { useEffect, useState } from "react";
import { OAuthButtons } from "@/components/OAuthButtons";
import { WalletDisplay } from "@/components/WalletDisplay";
import { para } from "@/client/para";
import { OAuthMethod } from "@getpara/web-sdk";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<string>("");
  const [error, setError] = useState<string>("");

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
    const connectUri = await para.getFarcasterConnectURL();
    window.open(connectUri, "farcasterConnectPopup", "popup=true");

    const { userExists, username } = await para.waitForFarcasterStatus();

    const authUrl = userExists
      ? await para.initiateUserLogin({ useShortUrl: false, farcasterUsername: username })
      : await para.getSetUpBiometricsURL({ authType: "farcaster", isForNewDevice: false });

    const popupWindow = window.open(authUrl, userExists ? "loginPopup" : "signUpPopup", "popup=true");

    if (!popupWindow) throw new Error("Failed to open popup window");

    await (userExists ? para.waitForLoginAndSetup({ popupWindow }) : para.waitForPasskeyAndCreateWallet());
  };

  const handleRegularOAuth = async (method: OAuthMethod) => {
    const oAuthURL = await para.getOAuthURL({method});
    window.open(oAuthURL, "oAuthPopup", "popup=true");

    const { email, userExists } = await para.waitForOAuth();

    if (!email) throw new Error("Email not found");

    const authUrl = userExists
      ? await para.initiateUserLogin({email, useShortUrl: false})
      : await para.getSetUpBiometricsURL({authType: "email", isForNewDevice: false});

    const popupWindow = window.open(authUrl, userExists ? "loginPopup" : "signUpPopup", "popup=true");

    if (!popupWindow) throw new Error("Failed to open popup window");

    const result = await (userExists ? para.waitForLoginAndSetup({popupWindow}) : para.waitForPasskeyAndCreateWallet());

    if ("needsWallet" in result && result.needsWallet) {
      await para.createWallet();
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
