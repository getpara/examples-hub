import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthLayout, ExternalWallet, ParaProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "./constants.ts";
import { celo, mainnet, polygon, sepolia } from "wagmi/chains";

const queryClient = new QueryClient();

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
            ExternalWallet.METAMASK,
            ExternalWallet.COINBASE,
            ExternalWallet.WALLETCONNECT,
            ExternalWallet.RAINBOW,
            ExternalWallet.ZERION,
            ExternalWallet.RABBY,
          ],
          createLinkedEmbeddedForExternalWallets: [ExternalWallet.METAMASK],
          evmConnector: {
            config: {
              chains: [mainnet, polygon, sepolia, celo],
            },
          },
          walletConnect: {
            projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "",
          },
        }}
        config={{ appName: "Para Modal + EVM Wallets Example" }}
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
