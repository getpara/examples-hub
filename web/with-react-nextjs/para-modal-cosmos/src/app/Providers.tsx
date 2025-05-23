"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExternalWallet, ParaProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/constants";
import { cosmoshub, osmosis, noble } from "graz/chains";

const queryClient = new QueryClient();

const cosmosChains = [cosmoshub, osmosis, noble];

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}
        externalWalletConfig={{
          wallets: [ExternalWallet.KEPLR, ExternalWallet.LEAP],
          createLinkedEmbeddedForExternalWallets: [ExternalWallet.KEPLR],
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
          authLayout: ["EXTERNAL:FULL"],
          onRampTestMode: true,
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
          logo: "/para.svg",
          recoverySecretStepEnabled: true,
          twoFactorAuthEnabled: false,
        }}
      >
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}
