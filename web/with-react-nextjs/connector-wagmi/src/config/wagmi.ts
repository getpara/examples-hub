"use client";

import { paraConnector } from "@getpara/wagmi-v2-integration";
import { para } from "@/lib/para";
import { WALLET_CONNECT_PROJECT_ID, SEPOLIA_RPC_URL } from "@/config";
import { queryClient } from "@/context/QueryProvider";
import { createConfig, CreateConfigParameters, http } from "wagmi";
import { coinbaseWallet, injected, metaMask, walletConnect } from "wagmi/connectors";
import { sepolia } from "wagmi/chains";

const connector = paraConnector({
  appName: "Para RainbowKit Example",
  authLayout: ["AUTH:FULL", "EXTERNAL:FULL"],
  chains: [sepolia],
  disableEmailLogin: false,
  disablePhoneLogin: false,
  logo: "/para.svg",
  oAuthMethods: ["APPLE", "DISCORD", "FACEBOOK", "FARCASTER", "GOOGLE", "TWITTER"],
  onRampTestMode: true,
  options: {},
  para,
  queryClient,
  recoverySecretStepEnabled: true,
  theme: {
    accentColor: "#888888",
    backgroundColor: "#FFFFFF",
    borderRadius: "none",
    darkAccentColor: "#AAAAAA",
    darkBackgroundColor: "#111111",
    darkForegroundColor: "#EEEEEE",
    font: "Inter",
    foregroundColor: "#222222",
    mode: "light",
  },
  twoFactorAuthEnabled: false,
});

const config = {
  chains: [sepolia],
  connectors: [
    connector,
    walletConnect({
      projectId: WALLET_CONNECT_PROJECT_ID,
    }),
    injected(),
    metaMask(),
    coinbaseWallet(),
  ],
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC_URL),
  },
} as CreateConfigParameters;

export const wagmiConfig = createConfig(config);
