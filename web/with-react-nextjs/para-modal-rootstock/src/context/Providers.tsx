"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/config/constants";
import { rootstockTestnet } from "wagmi/chains";

const queryClient = new QueryClient();

const ROOTSTOCK_TESTNET = {
  name: 'Rootstock Testnet',
  evmChainId: '31' as const,
  nativeTokenSymbol: 'tRBTC',
  logoUrl: 'https://raw.githubusercontent.com/rsksmart/rsk-contract-metadata/refs/heads/master/images/rootstock-orange.png',
  rpcUrl: 'https://public-node.testnet.rsk.co',
  explorer: {
    name: 'Rootstock Testnet Explorer',
    url: 'https://explorer.testnet.rootstock.io',
    txUrlFormat: 'https://explorer.testnet.rootstock.io/tx/{HASH}',
  },
  isTestnet: true,
};

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}
        externalWalletConfig={{
          wallets: ["METAMASK", "WALLETCONNECT"],
          includeWalletVerification: true,
          evmConnector: {
            config: {
              chains: [rootstockTestnet],
            },
          },
          walletConnect: {
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
          },
        }}
        config={{ appName: "Para Modal + EVM Wallets Example" }}
        paraModalConfig={{
          balances:{
            displayType: 'AGGREGATED',
            requestType: 'MAINNET_AND_TESTNET',
            additionalAssets: [              
              {
                name: 'tRBTC',
                symbol: 'tRBTC',
                logoUrl: 'https://raw.githubusercontent.com/rsksmart/rsk-contract-metadata/refs/heads/master/images/rootstock-orange.png',
                implementations: [
                    {
                      network: ROOTSTOCK_TESTNET,
                    },                  
                ],
              },
              {
                name: 'tRIF Token',
                symbol: 'tRIF',
                logoUrl: 'https://raw.githubusercontent.com/rsksmart/rsk-contract-metadata/refs/heads/master/images/rif.png',
                price: {
                  value: 1,
                  currency: 'USD',
                },
                implementations: [
                  {
                    network: ROOTSTOCK_TESTNET,
                    contractAddress: '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe',
                  },
                ],
              },
            ],
          },
          disableEmailLogin: false,
          disablePhoneLogin: false,
          authLayout: ["AUTH:FULL", "EXTERNAL:FULL"],
          oAuthMethods: ["GOOGLE"],
          onRampTestMode: true,
          theme: {
            foregroundColor: "#222222",
            backgroundColor: "#FFFFFF",
            accentColor: "#888888",
            darkForegroundColor: "#EEEEEE",
            darkBackgroundColor: "#111111",
            darkAccentColor: "#AAAAAA",
            mode: "light",
            borderRadius: "none",
            font: "Inter",
          },
          logo: "/para.svg",
          recoverySecretStepEnabled: true,
          twoFactorAuthEnabled: false,
        }}>
        {children}
      </ParaSDKProvider>
    </QueryClientProvider>
  );
}
