"use client";

import { ParaProvider as Provider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/config/constants";
import { cosmoshub, osmosis, noble } from "@getpara/graz/chains";

const cosmosChains = [cosmoshub, osmosis, noble];

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
        wallets: ["KEPLR", "LEAP"],
        createLinkedEmbeddedForExternalWallets: ["KEPLR", "LEAP"],
        cosmosConnector: {
          config: {
            chains: cosmosChains,
            selectedChainId: cosmoshub.chainId,
            multiChain: false,
            onSwitchChain: (chainId) => {
              console.log("Switched chain to:", chainId);
            },
          },
        },
      }}
      config={{ appName: "Para Modal + Cosmos Wallets Example" }}
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
