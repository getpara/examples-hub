import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { AuthLayout, ExternalWallet, ParaProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "./constants.ts";

const queryClient = new QueryClient();

const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}
        externalWalletConfig={{
          wallets: [
            ExternalWallet.GLOW,
            ExternalWallet.PHANTOM,
            ExternalWallet.BACKPACK,
          ],
          createLinkedEmbeddedForExternalWallets: [ExternalWallet.GLOW],
          solanaConnector: {
            config: {
              endpoint,
              chain: solanaNetwork,
              appIdentity: {
                uri:
                  typeof window !== "undefined"
                    ? `${window.location.protocol}//${window.location.host}`
                    : "",
              },
            },
          },
          walletConnect: {
            projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "",
          },
        }}
        config={{ appName: "Para Modal + Solana Wallets Example" }}
        paraModalConfig={{
          disableEmailLogin: false,
          disablePhoneLogin: false,
          authLayout: [AuthLayout.EXTERNAL_FULL],
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
        <App />
      </ParaProvider>
    </QueryClientProvider>
  </StrictMode>
);
