"use client";

import { ParaWeb } from "@getpara/react-sdk-lite";
import { paraConnector } from "@getpara/wagmi-v2-integration";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type CreateConnectorFn } from "wagmi";
import { APP_KIT_THEME_VARIABLES } from "@/lib/appKitTheme";
import { NETWORKS } from "@/lib/chain";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "";

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}

if (!PROJECT_ID) {
  console.warn("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set. Reown WalletConnect flows will not work.");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const para = typeof window !== "undefined" && API_KEY ? new ParaWeb(API_KEY) : null;

const connector = para
  ? paraConnector({
      appName: "Reown AppKit with Para",
      chains: [...NETWORKS],
      onRampTestMode: true,
      options: {},
      para,
      queryClient,
      recoverySecretStepEnabled: true,
    })
  : null;

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [...NETWORKS];

const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks,
  projectId: PROJECT_ID,
  connectors: connector ? [connector as CreateConnectorFn] : [],
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId: PROJECT_ID,
  metadata: {
    name: "Reown AppKit Example",
    description: "Reown AppKit with Next.js and Wagmi",
    url: "https://reown.com",
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
  },
  features: {
    analytics: true,
    email: false,
    socials: false,
    emailShowWallets: false,
  },
  themeMode: "light",
  themeVariables: APP_KIT_THEME_VARIABLES,
  enableEIP6963: false,
  enableInjected: false,
  enableWalletConnect: false,
  enableCoinbase: false,
  allowUnsupportedChain: false,
  allWallets: "HIDE",
});

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
