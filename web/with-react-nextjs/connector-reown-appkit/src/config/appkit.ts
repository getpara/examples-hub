"use client";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { AuthLayout } from "@getpara/react-sdk";
import { paraConnector } from "@getpara/wagmi-v2-integration";
import { para } from "@/client/para";
import { chains } from "@/constants/chains";
import { CreateConnectorFn } from "wagmi";
import { metaMask } from 'wagmi/connectors';
import { queryClient } from "@/client/queryClient";

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not set");
}

// Set up metadata
const metadata = {
  name: "Reown AppKit Example",
  description: "Reown AppKit with Next.js and Wagmi",
  url: "https://reown.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create Para connector
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
  authLayout: [AuthLayout.AUTH_FULL],
  recoverySecretStepEnabled: true,
  options: {},
});

// Create custom connectors array with Para first, then MetaMask
const connectors: CreateConnectorFn[] = [
  connector as any,  // Para connector first
  metaMask()         // MetaMask second
];

// Create wagmi adapter with custom connectors
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [...chains],
  projectId,
  connectors,
});

// Create modal
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [...chains],
  projectId,
  metadata,
  features: {
    analytics: true,
    email: false,  // Disable Reown's email option since Para has it
    socials: false, // Disable Reown's social options since Para has them
    emailShowWallets: false,
  },
  themeMode: "light",
  enableEIP6963: false, // Disable browser wallet discovery
  enableInjected: false, // Disable injected wallet discovery
  enableWalletConnect: false, // Disable WalletConnect
});
