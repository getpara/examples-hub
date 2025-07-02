"use client";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import type { OAuthMethod } from "@getpara/react-sdk";
import { paraConnector } from "@getpara/wagmi-v2-integration";
import { para } from "@/lib/para/client";
import { CreateConnectorFn } from "wagmi";
import { QueryClient } from "@tanstack/react-query";
import { mainnet, arbitrum, optimism, polygon, base } from "wagmi/chains";

export const APP_NAME = "Reown AppKit + Para Example";
export const APP_DESCRIPTION = "This example demonstrates how to integrate Para as a custom wagmi connector in Reown AppKit.";
export const chains = [mainnet, arbitrum, optimism, polygon, base] as const;

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
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
  oAuthMethods: ["APPLE", "DISCORD", "FACEBOOK", "FARCASTER", "GOOGLE", "TWITTER"] as OAuthMethod[],
  theme: {
    foregroundColor: "#2D3648",
    backgroundColor: "#FFFFFF",
    accentColor: "#0066CC",
    darkForegroundColor: "#E8EBF2",
    darkBackgroundColor: "#1A1F2B",
    darkAccentColor: "#4D9FFF",
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

const connectors: CreateConnectorFn[] = [
  connector as CreateConnectorFn,
];

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [...chains],
  projectId,
  connectors,
});

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [...chains],
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
