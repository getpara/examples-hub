"use client";

import type { PropsWithChildren } from "react";
import { ParaGrazConnector } from "@getpara/graz-integration";
import { ParaWeb } from "@getpara/react-sdk-lite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider, defineChainInfo, type ParaGrazConfig } from "graz";
import { ICS_PROVIDER_TESTNET } from "@/lib/chain";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}

const queryClient = new QueryClient();

const para = typeof window !== "undefined" && API_KEY ? new ParaWeb(API_KEY) : null;

const atom = {
  coinDenom: ICS_PROVIDER_TESTNET.currencySymbol,
  coinMinimalDenom: ICS_PROVIDER_TESTNET.denom,
  coinDecimals: ICS_PROVIDER_TESTNET.decimals,
};

const icsProviderTestnet = defineChainInfo({
  chainId: ICS_PROVIDER_TESTNET.chainId,
  chainName: ICS_PROVIDER_TESTNET.chainName,
  rpc: ICS_PROVIDER_TESTNET.rpcUrl,
  rest: ICS_PROVIDER_TESTNET.restUrl,
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: "cosmos",
    bech32PrefixAccPub: "cosmospub",
    bech32PrefixValAddr: "cosmosvaloper",
    bech32PrefixValPub: "cosmosvaloperpub",
    bech32PrefixConsAddr: "cosmosvalcons",
    bech32PrefixConsPub: "cosmosvalconspub",
  },
  currencies: [atom],
  feeCurrencies: [{ ...atom, gasPriceStep: { low: 0.01, average: 0.025, high: 0.04 } }],
  stakeCurrency: atom,
});

const paraConfig: ParaGrazConfig | undefined = para
  ? {
      paraWeb: para as ParaGrazConfig["paraWeb"],
      connectorClass: ParaGrazConnector,
      queryClient,
    }
  : undefined;

export function ParaProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [icsProviderTestnet],
          ...(paraConfig ? { paraConfig } : {}),
        }}>
        {children}
      </GrazProvider>
    </QueryClientProvider>
  );
}
