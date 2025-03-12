"use client";

import React, { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@getpara/rainbowkit";
import { WagmiProvider } from "wagmi";
import { queryClient, wagmiConfig } from "@/client/wagmi";

const rainbowkitTheme = lightTheme({
  accentColor: "#0066CC",
  accentColorForeground: "white",
  borderRadius: "none",
  fontStack: "system",
  overlayBlur: "large",
});

export const ParaProviders: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowkitTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
