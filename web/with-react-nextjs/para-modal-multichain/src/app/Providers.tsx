"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthLayout, ExternalWallet, ParaProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/constants";
import { sepolia, celo, mainnet, polygon } from "wagmi/chains";
import { cosmoshub, osmosis, noble } from "graz/chains";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

const queryClient = new QueryClient();

const cosmosChains = [cosmoshub, osmosis, noble];

const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);

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
          walletsWithParaAuth: [ExternalWallet.METAMASK],
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
        }}>
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}
