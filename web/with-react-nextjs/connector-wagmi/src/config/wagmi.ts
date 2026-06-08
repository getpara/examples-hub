"use client";

import { paraConnector } from "@getpara/wagmi-v2-integration";
import { para } from "@/lib/para/client";
import { SEPOLIA_RPC_URL } from "@/config/constants";
import { queryClient } from "@/context/QueryProvider";
import { createConfig, type CreateConfigParameters, http, cookieStorage, createStorage } from "wagmi";
import { sepolia } from "wagmi/chains";

const connector = para
  ? paraConnector({
      appName: "Para Wagmi Example",
      chains: [sepolia],
      onRampTestMode: true,
      options: {},
      para,
      queryClient,
      recoverySecretStepEnabled: true,
    })
  : null;

const config = {
  chains: [sepolia],
  connectors: connector ? [connector] : [],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC_URL),
  },
} as CreateConfigParameters;

export const wagmiConfig = createConfig(config);
