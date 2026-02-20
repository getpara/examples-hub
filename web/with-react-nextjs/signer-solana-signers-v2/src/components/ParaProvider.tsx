"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { API_KEY, ENVIRONMENT } from "@/config/constants";

// Solana network configuration
const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

export function ParaProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        config={{ appName: "Para Solana Signers V2 Example" }}
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
