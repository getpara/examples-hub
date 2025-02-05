"use client";

import { AuthLayout, OAuthMethod } from "@getpara/react-sdk";
import { paraConnector } from "@getpara/wagmi-v2-integration";
import { para } from "@/client/para";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, WagmiProvider, CreateConfigParameters, http } from "wagmi";
import { injected, coinbaseWallet, walletConnect, metaMask } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";

type Props = {
  children: React.ReactNode;
};

const connector = paraConnector({
  para: para,
  chains: [sepolia, mainnet],
  appName: "Para RainbowKit Example",
  logo: "/para.svg",
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
  options: {},
});

const config: CreateConfigParameters = {
  chains: [sepolia, mainnet],
  connectors: [
    connector,
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
    }),
    injected(),
    metaMask(),
    coinbaseWallet(),
  ],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
};

const wagmiConfig = createConfig(config);

const queryClient = new QueryClient();

export const ParaProviders: React.FC<Props> = ({ children }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
