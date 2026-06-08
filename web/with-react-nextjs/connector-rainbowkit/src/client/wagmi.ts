import { QueryClient } from "@tanstack/react-query";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { getParaWallet, type GetParaOpts } from "@getpara/rainbowkit-wallet";
import { Environment } from "@getpara/web-sdk";
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";

const APP_NAME = "Para RainbowKit Example";
const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY || "";
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}

if (!WALLET_CONNECT_PROJECT_ID) {
  console.warn("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set. WalletConnect will not work.");
}

const PARA_API_KEY = API_KEY || "missing-para-api-key";
const PROJECT_ID = WALLET_CONNECT_PROJECT_ID || "missing-walletconnect-project-id";

export const queryClient = new QueryClient();

const paraWalletOpts: GetParaOpts = {
  para: {
    environment: Environment.BETA,
    apiKey: PARA_API_KEY,
  },
  queryClient,
  appName: APP_NAME,
  onRampTestMode: true,
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
    appName: APP_NAME,
    projectId: PROJECT_ID,
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
