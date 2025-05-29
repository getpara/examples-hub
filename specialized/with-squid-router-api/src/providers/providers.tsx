"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider } from "@getpara/react-sdk";
import { PARA_API_KEY, PARA_ENVIRONMENT } from "@/constants";

const queryClient = new QueryClient();

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: PARA_API_KEY,
          env: PARA_ENVIRONMENT,
        }}>
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}
