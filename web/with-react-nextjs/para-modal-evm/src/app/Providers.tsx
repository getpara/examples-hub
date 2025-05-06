"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExternalWallet, ParaProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/constants";
import { sepolia, celo, mainnet, polygon } from "wagmi/chains";

const queryClient = new QueryClient();

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}
        externalWalletConfig={{
          wallets: [
            ExternalWallet.METAMASK,
            ExternalWallet.COINBASE,
            ExternalWallet.WALLETCONNECT,
            ExternalWallet.RAINBOW,
            ExternalWallet.ZERION,
            ExternalWallet.RABBY,
          ],
          walletsWithParaAuth: [ExternalWallet.METAMASK],
          evmConnector: {
            config: {
              chains: [mainnet, polygon, sepolia, celo],
            },
          },
          walletConnect: {
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
          },
        }}
        config={{ appName: "Para Modal + EVM Wallets Example" }}
        paraModalConfig={{
          disableEmailLogin: false,
          disablePhoneLogin: false,
          authLayout: ["EXTERNAL:FULL"],
          onRampTestMode: true,
          theme: {
            foregroundColor: "#2D3648",
            backgroundColor: "#FFFFFF",
            accentColor: "#0066CC",
            darkForegroundColor: "#E8EBF2",
            darkBackgroundColor: "#1A1F2B",
            darkAccentColor: "#4D9FFF",
            mode: "light",
            borderRadius: "none",
            font: "Inter",
          },
          logo: "/para.svg",
          recoverySecretStepEnabled: true,
          twoFactorAuthEnabled: false,
        }}>
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}
