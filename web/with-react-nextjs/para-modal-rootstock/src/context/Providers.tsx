"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider as ParaSDKProvider } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "@/config/constants";
import { rootstockTestnet } from "wagmi/chains";

const queryClient = new QueryClient();

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
                    network: {
                      name: 'Rootstock Testnet',
                      evmChainId: '31',
                      nativeTokenSymbol: 'tRBTC',                      
                      rpcUrl: 'https://public-node.testnet.rsk.co',                      
                      isTestnet: true,
                      explorer: {
                        name: 'Rootstock Explorer',
                        url: 'https://explorer.testnet.rootstock.io/',
                        txUrlFormat: 'https://explorer.testnet.rootstock.io/tx/{HASH}',
                      },
                    },
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
