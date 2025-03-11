import { QueryClient } from "@tanstack/react-query";
import { connectorsForWallets } from "@getpara/rainbowkit";
import { getParaWallet, GetParaOpts, OAuthMethod, AuthLayout } from "@getpara/rainbowkit-wallet";
import { Environment } from "@getpara/web-sdk";
import { createConfig, http } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY || "";

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

const paraWalletOpts: GetParaOpts = {
  para: {
    environment: Environment.BETA,
    apiKey: API_KEY,
  },
  appName: "Para RainbowKit Example",
  logo: "/para.svg",
  oAuthMethods: [
    OAuthMethod.APPLE,
    OAuthMethod.DISCORD,
    OAuthMethod.FACEBOOK,
    OAuthMethod.FARCASTER,
    OAuthMethod.GOOGLE,
    OAuthMethod.TWITTER,
  ],
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
  onRampTestMode: true,
  disableEmailLogin: false,
  disablePhoneLogin: false,
  authLayout: [AuthLayout.AUTH_FULL],
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
    [mainnet.id]: http(),
  },
  ssr: true,
});

export const queryClient = new QueryClient();
