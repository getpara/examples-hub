import { QueryClient } from "@tanstack/react-query";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { getParaWallet, GetParaOpts } from "@getpara/rainbowkit-wallet";
import { Environment } from "@getpara/web-sdk";
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY || "";

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}

const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
const PARA_API_KEY = API_KEY || "missing-para-api-key";

export const queryClient = new QueryClient();

const paraWalletOpts: GetParaOpts = {
  para: {
    environment: Environment.BETA,
    apiKey: PARA_API_KEY,
  },
  queryClient,
  appName: "Para RainbowKit Example",
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
    appName: "Para RainbowKit Example",
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
