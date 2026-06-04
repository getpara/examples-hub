"use client";

import { paraConnector } from "@getpara/wagmi-v2-integration";
import { para } from "@/lib/para/client";
import { WALLET_CONNECT_PROJECT_ID, SEPOLIA_RPC_URL } from "@/config/constants";
import { queryClient } from "@/context/QueryProvider";
import { createConfig, CreateConfigParameters, http, cookieStorage, createStorage } from "wagmi";
import { coinbaseWallet, injected, metaMask, walletConnect } from "wagmi/connectors";
import { sepolia } from "wagmi/chains";

const connector = para ? paraConnector({
  appName: "Para Wagmi Example",
  chains: [sepolia],
  onRampTestMode: true,
  options: {},
  para,
  queryClient,
  recoverySecretStepEnabled: true,
}) : null;

const config = {
  chains: [sepolia],
  connectors: [
    ...(connector ? [connector] : []),
    walletConnect({
      projectId: WALLET_CONNECT_PROJECT_ID,
    }),
    injected(),
    metaMask(),
    coinbaseWallet(),
  ],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC_URL),
  },
} as CreateConfigParameters;

export const wagmiConfig = createConfig(config);
