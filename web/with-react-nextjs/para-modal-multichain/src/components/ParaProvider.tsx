'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Environment, ParaProvider as ParaSDKProvider } from '@getpara/react-sdk';
import { sepolia, celo, mainnet, polygon } from 'wagmi/chains';
import { cosmoshub, osmosis, noble } from 'graz/chains';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Para API configuration - set these in your .env file
const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? '';
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  console.warn('NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.');
}

const queryClient = new QueryClient();
// Chain configurations
const cosmosChains = [cosmoshub, osmosis, noble];
const solanaNetwork = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(solanaNetwork);

export function ParaProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaSDKProvider
        paraClientConfig={{
          apiKey: API_KEY,
          env: ENVIRONMENT,
        }}
        externalWalletConfig={{
          evmConnector: {
            config: {
              chains: [mainnet, polygon, sepolia, celo],
            },
          },
          cosmosConnector: {
            config: {
              chains: cosmosChains,
              selectedChainId: cosmoshub.chainId,
              multiChain: false,
              onSwitchChain: () => {},
            },
          },
          solanaConnector: {
            config: {
              endpoint,
              chain: solanaNetwork,
            },
          },
        }}
        paraModalConfig={{
          onRampTestMode: true,
          recoverySecretStepEnabled: true,
        }}
      >
        {children}
      </ParaSDKProvider>
    </QueryClientProvider>
  );
}
