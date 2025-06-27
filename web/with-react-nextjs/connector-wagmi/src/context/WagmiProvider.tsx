"use client";

import { WagmiProvider as Provider } from "wagmi";
import { wagmiConfig } from "@/config/wagmi";
import { PropsWithChildren } from "react";

export const WagmiProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return <Provider config={wagmiConfig}>{children}</Provider>;
};
