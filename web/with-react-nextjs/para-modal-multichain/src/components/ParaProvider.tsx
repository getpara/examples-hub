"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ParaWeb, { Environment, ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";
import { sepolia, celo, mainnet, polygon } from "wagmi/chains";
import { cosmoshub, osmosis, noble } from "graz/chains";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

// Para API configuration - set these in your .env file
const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

const queryClient = new QueryClient();
const para = new ParaWeb(ENVIRONMENT, API_KEY);

// Chain configurations
const cosmosChains = [cosmoshub, osmosis, noble];
const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={para}
        externalWalletConfig={{
          wallets: [
            "METAMASK",
            "COINBASE",
            "WALLETCONNECT",
            "RAINBOW",
            "ZERION",
            "KEPLR",
            "LEAP",
            "RABBY",
            "GLOW",
            "PHANTOM",
            "BACKPACK",
            "SOLFLARE",
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
                uri: typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "",
              },
            },
          },
          walletConnect: {
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
          },
        }}
        config={{ appName: "Para Modal + Multichain Example" }}
        paraModalConfig={{
          disableEmailLogin: false,
          disablePhoneLogin: false,
          authLayout: ["EXTERNAL:FULL"],
          oAuthMethods: [],
          onRampTestMode: true,
          theme: {
            foregroundColor: "#2E2926",
            backgroundColor: "#FFFFFF",
            accentColor: "#E8642B",
            mode: "light",
            borderRadius: "md",
            font: "Inter",
          },
          logo: "/para.svg",
          recoverySecretStepEnabled: true,
          twoFactorAuthEnabled: false,
        }}>
        {children}
      </ParaSDKProvider>
    </QueryClientProvider>
  );
}
