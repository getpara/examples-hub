"use client";

import { ParaProvider as Provider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/config/constants";
import { sepolia, celo, mainnet, polygon } from "wagmi/chains";

export function ParaProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider
      paraClientConfig={{
        apiKey: API_KEY,
        env: ENVIRONMENT,
      }}
      externalWalletConfig={{
        wallets: ["METAMASK", "COINBASE", "WALLETCONNECT", "RAINBOW", "ZERION", "RABBY"],
        // createLinkedEmbeddedForExternalWallets: ["METAMASK"],
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
        authLayout: ["AUTH:FULL", "EXTERNAL:FULL"],
        oAuthMethods: ["APPLE", "DISCORD", "FACEBOOK", "FARCASTER", "GOOGLE", "TWITTER"],
        onRampTestMode: true,
        theme: {
          foregroundColor: "#222222",
          backgroundColor: "#FFFFFF",
          accentColor: "#888888",
          darkForegroundColor: "#EEEEEE",
          darkBackgroundColor: "#111111",
          darkAccentColor: "#AAAAAA",
          mode: "light",
          borderRadius: "none",
          font: "Inter",
        },
        logo: "/para.svg",
        recoverySecretStepEnabled: true,
        twoFactorAuthEnabled: false,
      }}>
      {children}
    </Provider>
  );
}
