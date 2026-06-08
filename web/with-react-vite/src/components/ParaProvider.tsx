import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Environment, ParaProvider as ParaSDKProvider } from '@getpara/react-sdk';
import { sepolia, celo, mainnet, polygon } from 'wagmi/chains';
import { cosmoshub, osmosis, noble } from 'graz/chains';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Para API configuration - set these in your .env file
const API_KEY = import.meta.env.VITE_PARA_API_KEY ?? '';
const ENVIRONMENT = (import.meta.env.VITE_PARA_ENVIRONMENT as Environment) || Environment.BETA;

if (!API_KEY) {
  throw new Error('API key is not defined. Please set VITE_PARA_API_KEY in your environment variables.');
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
              onSwitchChain: chainId => {
                console.log('Switched chain to:', chainId);
              },
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
