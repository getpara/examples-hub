import { QueryClient } from "@tanstack/react-query";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { getParaWallet, GetParaOpts } from "@getpara/rainbowkit-wallet";
import { Environment } from "@getpara/web-sdk";
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY || "";

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

export const queryClient = new QueryClient();

const paraWalletOpts: GetParaOpts = {
  para: {
    environment: Environment.BETA,
    apiKey: API_KEY,
  },
  queryClient,
  appName: "Para RainbowKit Example",
  logo: "/para.svg",
  oAuthMethods: ["APPLE", "DISCORD", "FACEBOOK", "FARCASTER", "GOOGLE", "TWITTER"],
  theme: {
    foregroundColor: "#2D3648",
    backgroundColor: "#FFFFFF",
    accentColor: "#0066CC",
    mode: "light",
    borderRadius: "none",
    font: "Inter",
  },
  onRampTestMode: true,
  disableEmailLogin: false,
  disablePhoneLogin: false,
  authLayout: ["AUTH:FULL"],
  recoverySecretStepEnabled: true,
};

const paraWallet = getParaWallet(paraWalletOpts);

const connectors = connectorsForWallets(
  [
    {
      groupName: "Social Login",
      wallets: [paraWallet],
    },
  ],
  {
    appName: "Para RainbowKit Example",
    appDescription: "Example of Para integration with RainbowKit Wallet Connector",
    projectId: WALLET_CONNECT_PROJECT_ID,
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [sepolia],
  multiInjectedProviderDiscovery: false,
  transports: {
    [sepolia.id]: http(),
  },
  ssr: true,
});
