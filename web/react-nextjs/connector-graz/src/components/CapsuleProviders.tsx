"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";
import { cosmoshub } from "graz/chains";

type Props = {
  children: React.ReactNode;
};

// Example chain config for Cosmos Hub; you can add more as needed.
const cosmosChains = [
  {
    ...cosmoshub,
    rpc: "https://rpc.cosmos.directory/cosmoshub",
    rest: "https://rest.cosmos.directory/cosmoshub",
  },
];

const queryClient = new QueryClient();

export const CapsuleProviders: React.FC<Props> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshub],
          capsuleConfig: {
            apiKey: process.env.NEXT_PUBLIC_CAPSULE_API_KEY || "",
            env: "BETA",
          },
        }}>
        {children}
      </GrazProvider>
    </QueryClientProvider>
  );
};
