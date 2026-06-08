"use client";

import type { PropsWithChildren } from "react";
import { para } from "@/lib/para/client";
import { CHAIN_ID } from "@/config/constants";
import { ParaGrazConnector } from "@getpara/graz-integration";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider, defineChainInfo, type ParaGrazConfig } from "graz";

const queryClient = new QueryClient();

const cosmosicsprovidertestnet = defineChainInfo({
  chainId: CHAIN_ID,
  chainName: "Cosmos ICS Provider Testnet",
  rpc: "https://rpc.provider-sentry-01.ics-testnet.polypore.xyz",
  rest: "https://rest.provider-sentry-01.ics-testnet.polypore.xyz",
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: "cosmos",
    bech32PrefixAccPub: "cosmospub",
    bech32PrefixValAddr: "cosmosvaloper",
    bech32PrefixValPub: "cosmosvaloperpub",
    bech32PrefixConsAddr: "cosmosvalcons",
    bech32PrefixConsPub: "cosmosvalconspub",
  },
  currencies: [
    {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      gasPriceStep: { low: 0.01, average: 0.025, high: 0.04 },
    },
  ],
  stakeCurrency: {
    coinDenom: "ATOM",
    coinMinimalDenom: "uatom",
    coinDecimals: 6,
  },
});

export function Provider({ children }: PropsWithChildren) {
  const paraConfig: ParaGrazConfig | undefined = para
    ? {
        paraWeb: para as ParaGrazConfig["paraWeb"],
        connectorClass: ParaGrazConnector,
        queryClient,
      }
    : undefined;

  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmosicsprovidertestnet],
          ...(paraConfig ? { paraConfig } : {}),
        }}>
        {children}
      </GrazProvider>
    </QueryClientProvider>
  );
}
