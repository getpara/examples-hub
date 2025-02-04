import {
  ParaEvmProvider,
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  zerionWallet,
  rabbyWallet,
} from '@getpara/evm-wallet-connectors';
import { ParaCosmosProvider, keplrWallet, leapWallet } from '@getpara/cosmos-wallet-connectors';
import { sepolia, celo, mainnet, polygon } from 'wagmi/chains';
import { Content } from './components/Content';
import { backpackWallet, ParaSolanaProvider, glowWallet, phantomWallet } from '@getpara/solana-wallet-connectors';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useMemo } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import { useCosmosStore } from './stores/cosmosStore/useCosmosStore';
import { axelar, cosmoshub, osmosis, sommelier, stargaze } from '@getpara/graz/chains';
import { ParaProvider, Environment } from '@getpara/react-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const cosmosChains = [
  { ...cosmoshub, rpc: 'https://rpc.cosmos.directory/cosmoshub', rest: 'https://rest.cosmos.directory/cosmoshub' },
  { ...sommelier, rpc: 'https://rpc.cosmos.directory/sommelier', rest: 'https://rest.cosmos.directory/sommelier' },
  { ...stargaze, rpc: 'https://rpc.cosmos.directory/stargaze', rest: 'https://rest.cosmos.directory/stargaze' },
  { ...axelar, rpc: 'https://rpc.cosmos.directory/axelar', rest: 'https://rest.cosmos.directory/axelar' },
  { ...osmosis, rpc: 'https://rpc.cosmos.directory/osmosis', rest: 'https://rest.cosmos.directory/osmosis' },
];

const solanaNetwork = WalletAdapterNetwork.Devnet;

export const App = () => {
  const selectedCosmosChainId = useCosmosStore(state => state.selectedChainId);
  const updateCosmosState = useCosmosStore(state => state.updateState);

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(solanaNetwork), [solanaNetwork]);

  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          env: Environment.SANDBOX,
          apiKey: '8ee2d015fbc6062a6e30bdc472f2946c',
        }}
        callbacks={{
          onLogout: event => {
            console.log('Logout:', event.detail);
          },
          onLogin: event => {
            console.log('Login:', event.detail);
          },
          onSignMessage: event => {
            console.log('messageSigned:', event.detail);
          },
        }}
      >
        <ParaCosmosProvider
          selectedChainId={selectedCosmosChainId}
          chains={cosmosChains}
          wallets={[keplrWallet, leapWallet]}
          onSwitchChain={chainId => {
            updateCosmosState({ selectedChainId: chainId });
          }}
          multiChain
          walletConnect={{ options: { projectId: 'dc87c564a371d823d3795ae407391656' } }}
        >
          <ParaEvmProvider
            config={{
              projectId: 'dc87c564a371d823d3795ae407391656',
              appName: 'Para Example',
              chains: [mainnet, polygon, sepolia, celo],
              wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, zerionWallet, coinbaseWallet, rabbyWallet],
            }}
          >
            <ParaSolanaProvider
              endpoint={endpoint}
              wallets={[glowWallet, phantomWallet, backpackWallet]}
              chain={solanaNetwork}
              // Refer to https://docs.solanamobile.com/reference/typescript/mobile-wallet-adapter#web3mobilewalletauthorize for how appIdentity fields work
              appIdentity={{ name: 'Para Example', uri: `${location.protocol}//${location.host}` }}
            >
              <Content />
            </ParaSolanaProvider>
          </ParaEvmProvider>
        </ParaCosmosProvider>
      </ParaProvider>
    </QueryClientProvider>
  );
};
