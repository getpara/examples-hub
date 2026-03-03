"use client";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { paraConnector } from "@getpara/wagmi-v2-integration";
import { para } from "@/lib/para/client";
import { CreateConnectorFn } from "wagmi";
import { QueryClient } from "@tanstack/react-query";
import { mainnet, arbitrum, optimism, polygon, base } from "wagmi/chains";
import type { AppKitNetwork } from "@reown/appkit/networks";

export const APP_NAME = "Reown AppKit + Para Example";
export const APP_DESCRIPTION =
  "This example demonstrates how to integrate Para as a custom wagmi connector in Reown AppKit.";
export const chains = [mainnet, arbitrum, optimism, polygon, base] as const;

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const metadata = {
  name: "Reown AppKit Example",
  description: "Reown AppKit with Next.js and Wagmi",
  url: "https://reown.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

const connector = paraConnector({
  para: para,
  chains: [...chains],
  appName: "Reown AppKit with Para",
  logo: "/para.svg",
  queryClient,
  oAuthMethods: ["APPLE", "DISCORD", "FACEBOOK", "FARCASTER", "GOOGLE", "TWITTER"],
  theme: {
    foregroundColor: "#2D3648",
    backgroundColor: "#FFFFFF",
    accentColor: "#0066CC",
    mode: "light",
    borderRadius: "none" as const,
    font: "Inter",
  },
  onRampTestMode: true,
  disableEmailLogin: false,
  disablePhoneLogin: false,
  authLayout: ["AUTH:FULL"],
  recoverySecretStepEnabled: true,
  options: {},
});

const connectors: CreateConnectorFn[] = [connector as CreateConnectorFn];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [...chains] as [AppKitNetwork, ...AppKitNetwork[]],
  projectId,
  connectors,
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [...chains] as [AppKitNetwork, ...AppKitNetwork[]],
  projectId,
  metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
    emailShowWallets: false,
  },
  themeMode: "light",
  enableEIP6963: false,
  enableInjected: false,
  enableWalletConnect: false,
  enableCoinbase: false,
  allowUnsupportedChain: false,
  allWallets: "HIDE",
});
