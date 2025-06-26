"use client";

import { ParaProvider as Provider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/config/constants";
import { sepolia, celo, mainnet, polygon } from "wagmi/chains";
import { cosmoshub, osmosis, noble } from "@getpara/graz/chains";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

const cosmosChains = [cosmoshub, osmosis, noble];

const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);

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
        createLinkedEmbeddedForExternalWallets: ["METAMASK", "PHANTOM", "KEPLR"],
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
      config={{ appName: "Para Modal + Multichain Wallets Example" }}
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
