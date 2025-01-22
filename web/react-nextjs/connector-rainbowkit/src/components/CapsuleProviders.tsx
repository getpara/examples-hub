"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, connectorsForWallets, lightTheme } from "@usecapsule/rainbowkit";
import { getCapsuleWallet, GetCapsuleOpts, OAuthMethod, AuthLayout } from "@usecapsule/rainbowkit-wallet";
import { Environment } from "@usecapsule/web-sdk";
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";

type Props = {
  children: React.ReactNode;
};

const API_KEY = process.env.NEXT_PUBLIC_CAPSULE_API_KEY || "";

const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

const capsuleWalletOpts: GetCapsuleOpts = {
  capsule: {
    environment: Environment.BETA,
    apiKey: API_KEY,
  },
  appName: "Capsule RainbowKit Example",
  logo: "/capsule.svg",
  oAuthMethods: [
    OAuthMethod.APPLE,
    OAuthMethod.DISCORD,
    OAuthMethod.FACEBOOK,
    OAuthMethod.FARCASTER,
    OAuthMethod.GOOGLE,
    OAuthMethod.TWITTER,
  ],
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
  onRampTestMode: true,
  disableEmailLogin: false,
  disablePhoneLogin: false,
  authLayout: [AuthLayout.AUTH_FULL],
  recoverySecretStepEnabled: true,
};

const capsuleWallet = getCapsuleWallet(capsuleWalletOpts);

const connectors = connectorsForWallets(
  [
    {
      groupName: "Social Login",
      wallets: [capsuleWallet],
    },
  ],
  {
    appName: "Capsule RainbowKit Example",
    appDescription: "Example of Capsule integration with RainbowKit Wallet Connector",
    projectId: WALLET_CONNECT_PROJECT_ID,
  }
);

const wagmiConfig = createConfig({
  connectors,
  chains: [sepolia],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

const rainbowkitTheme = lightTheme({
  accentColor: "#0066CC",
  accentColorForeground: "white",
  borderRadius: "none",
  fontStack: "system",
  overlayBlur: "large",
});

export const CapsuleProviders: React.FC<Props> = ({ children }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowkitTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
