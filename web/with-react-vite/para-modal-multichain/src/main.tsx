import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthLayout, ExternalWallet, ParaProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "./constants.ts";
import { sepolia, celo, mainnet, polygon } from "wagmi/chains";
import { cosmoshub } from "@getpara/graz/chains";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

const queryClient = new QueryClient();

const cosmosChains = [
  {
    ...cosmoshub,
    rpc: "https://rpc.cosmos.directory/cosmoshub",
    rest: "https://rest.cosmos.directory/cosmoshub",
  },
];

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
            ExternalWallet.METAMASK,
            ExternalWallet.COINBASE,
            ExternalWallet.WALLETCONNECT,
            ExternalWallet.RAINBOW,
            ExternalWallet.ZERION,
            ExternalWallet.KEPLR,
            ExternalWallet.LEAP,
            ExternalWallet.RABBY,
            ExternalWallet.GLOW,
            ExternalWallet.PHANTOM,
            ExternalWallet.BACKPACK,
          ],
          evmConnector: {
            config: {
              chains: [mainnet, polygon, sepolia, celo],
            },
          },
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
        config={{ appName: "Para EVM Wallet Connect" }}
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
