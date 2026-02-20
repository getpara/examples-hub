import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Environment, ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";
import { sepolia, celo, mainnet, polygon } from "wagmi/chains";
import { cosmoshub, osmosis, noble } from "graz/chains";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

// Para API configuration - set these in your .env file
const API_KEY = import.meta.env.VITE_PARA_API_KEY ?? "";
const ENVIRONMENT = (import.meta.env.VITE_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  throw new Error("API key is not defined. Please set VITE_PARA_API_KEY in your environment variables.");
}

const queryClient = new QueryClient();

// Chain configurations
const cosmosChains = [cosmoshub, osmosis, noble];
const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
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
            projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "",
          },
        }}
        config={{ appName: "Para Modal + Multichain Example" }}
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
            mode: "light",
            borderRadius: "none",
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
