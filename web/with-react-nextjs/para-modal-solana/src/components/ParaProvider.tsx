"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Environment, ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

// Para API configuration - set these in your .env file
const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

const queryClient = new QueryClient();

// Solana network configuration
const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}
        externalWalletConfig={{
          wallets: ["GLOW", "PHANTOM", "BACKPACK", "SOLFLARE"],
          createLinkedEmbeddedForExternalWallets: ["GLOW", "PHANTOM", "BACKPACK", "SOLFLARE"],
          solanaConnector: {
            config: {
              endpoint,
              chain: solanaNetwork,
              appIdentity: {
                uri: typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "",
              },
            },
          },
          walletConnect: {
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
          },
        }}
        config={{ appName: "Para Modal + Solana Example" }}
        paraModalConfig={{
          disableEmailLogin: false,
          disablePhoneLogin: false,
          authLayout: ["AUTH:FULL", "EXTERNAL:FULL"],
          oAuthMethods: ["APPLE", "DISCORD", "FACEBOOK", "FARCASTER", "GOOGLE", "TWITTER"],
          onRampTestMode: true,
          theme: {
            foregroundColor: "#222222",
            backgroundColor: "#FFFFFF",
            accentColor: "#888888",
            darkForegroundColor: "#EEEEEE",
            darkBackgroundColor: "#111111",
            darkAccentColor: "#AAAAAA",
            mode: "light",
            borderRadius: "none",
            font: "Inter",
          },
          logo: "/para.svg",
          recoverySecretStepEnabled: true,
          twoFactorAuthEnabled: false,
        }}>
        {children}
      </ParaSDKProvider>
    </QueryClientProvider>
  );
}
