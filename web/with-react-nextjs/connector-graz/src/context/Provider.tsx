"use client";

import { para } from "@/lib/para/client";
import { ParaGrazConfig } from "@getpara/graz-integration";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";
import { cosmosicsprovidertestnet } from "graz/chains";
import { PropsWithChildren } from "react";

const queryClient = new QueryClient();

const paraConfig: ParaGrazConfig = {
  paraWeb: para!,
  modalProps: { appName: "MyApp" },
  queryClient: queryClient,
};

export const Provider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {
        <GrazProvider
          grazOptions={{
            chains: [cosmosicsprovidertestnet],
            paraConfig,
          }}>
          {children}
        </GrazProvider>
      }
    </QueryClientProvider>
  );
};
