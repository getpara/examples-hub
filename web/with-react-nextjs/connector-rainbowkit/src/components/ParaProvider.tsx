"use client";

import { getParaWallet } from "@getpara/rainbowkit-wallet";
import { Environment } from "@getpara/web-sdk";
import { connectorsForWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { rainbowKitTheme } from "@/lib/rainbowKitTheme";

const APP_NAME = "Para RainbowKit Example";
const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "";

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}

if (!WALLET_CONNECT_PROJECT_ID) {
  console.warn("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set. WalletConnect will not work.");
}

const queryClient = new QueryClient();

const paraWallet = getParaWallet({
  para: {
    environment: ENVIRONMENT,
    apiKey: API_KEY || "missing-para-api-key",
  },
  queryClient,
  appName: APP_NAME,
  onRampTestMode: true,
  recoverySecretStepEnabled: true,
});

const connectors = connectorsForWallets(
  [
    {
      groupName: "Social Login",
      wallets: [paraWallet],
    },
  ],
  {
    appName: APP_NAME,
    projectId: WALLET_CONNECT_PROJECT_ID || "missing-walletconnect-project-id",
  }
);

const wagmiConfig = createConfig({
  connectors,
  chains: [sepolia],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
