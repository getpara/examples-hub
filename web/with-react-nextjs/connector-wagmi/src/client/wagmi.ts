import { AuthLayout, OAuthMethod } from "@getpara/react-sdk";
import { paraConnector } from "@getpara/wagmi-v2-integration";
import { para } from "@/client/para";
import { QueryClient } from "@tanstack/react-query";
import { createConfig, CreateConfigParameters, http } from "wagmi";
import { injected, coinbaseWallet, walletConnect, metaMask } from "wagmi/connectors";
import { mainnet, sepolia } from "wagmi/chains";

const connector = paraConnector({
  para: para,
  chains: [sepolia, mainnet],
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
  options: {},
});

const config = {
  chains: [sepolia, mainnet],
  connectors: [
    connector,
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
    }),
    injected(),
    metaMask(),
    coinbaseWallet(),
  ],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
} as CreateConfigParameters;

export const wagmiConfig = createConfig(config);

export const queryClient = new QueryClient();
