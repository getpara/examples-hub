import { sepolia, celo, mainnet, polygon } from 'wagmi/chains';
import { Content } from './components/Content';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { axelar, cosmoshub, osmosis, sommelier, stargaze } from '@getpara/graz/chains';
import { ParaProvider } from '@getpara/react-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useModalStateStore } from './stores/modalStateStore/useModalStateStore';
import { useCosmosStore } from './stores/cosmosStore/useCosmosStore';
import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

const queryClient = new QueryClient();

export const cosmosChains = [
  {
    ...cosmoshub,
    rpc: 'https://rpc.cosmos.directory/cosmoshub',
    rest: 'https://rest.cosmos.directory/cosmoshub',
  },
  {
    ...sommelier,
    rpc: 'https://rpc.cosmos.directory/sommelier',
    rest: 'https://rest.cosmos.directory/sommelier',
  },
  {
    ...stargaze,
    rpc: 'https://rpc.cosmos.directory/stargaze',
    rest: 'https://rest.cosmos.directory/stargaze',
  },
  {
    ...axelar,
    rpc: 'https://rpc.cosmos.directory/axelar',
    rest: 'https://rest.cosmos.directory/axelar',
  },
  {
    ...osmosis,
    rpc: 'https://rpc.cosmos.directory/osmosis',
    rest: 'https://rest.cosmos.directory/osmosis',
  },
];

const solanaNetwork = WalletAdapterNetwork.Devnet;

const endpoint = clusterApiUrl(solanaNetwork);

export const App = () => {
  const oAuthMethods = useModalStateStore(state => state.oAuthMethods);
  const authLayout = useModalStateStore(state => state.authLayout);
  const backgroundColor = useModalStateStore(state => state.backgroundColor);
  const foregroundColor = useModalStateStore(state => state.foregroundColor);
  const accentColor = useModalStateStore(state => state.accentColor);
  const mode = useModalStateStore(state => state.mode);
  const logo = useModalStateStore(state => state.logo);
  const selectedCosmosChainId = useCosmosStore(state => state.selectedChainId);
  const updateCosmosState = useCosmosStore(state => state.updateState);
  const externalWallets = useModalStateStore(state => state.externalWallets);
  const externalWalletConnectionOnly = useModalStateStore(state => state.externalWalletConnectionOnly);
  const externalWalletIncludeVerification = useModalStateStore(state => state.externalWalletIncludeVerification);
  const farcasterDisableAutoConnect = useModalStateStore(state => state.farcasterDisableAutoConnect);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          env: import.meta.env.VITE_ENVIRONMENT,
          apiKey: import.meta.env.VITE_PARA_API_KEY,
        }}
        config={{
          appName: 'Para External Wallet Example',
          rpcUrl: 'https://sepolia.drpc.org',
          farcasterMiniAppConfig: farcasterDisableAutoConnect
            ? {
                disableAutoConnect: true,
              }
            : undefined,
        }}
        paraModalConfig={{
          oAuthMethods: oAuthMethods,
          authLayout: authLayout,
          theme: {
            mode,
            foregroundColor,
            backgroundColor,
            accentColor,
          },
          logo: logo,
          onRampTestMode: true,
          isGuestModeEnabled: true,
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
        externalWalletConfig={{
          connectionOnly: externalWalletConnectionOnly,
          includeWalletVerification: externalWalletIncludeVerification,
          wallets: externalWallets,
          createLinkedEmbeddedForExternalWallets: 'ALL',
          // appDescription
          // appIcon
          // appUrl
          evmConnector: {
            config: {
              chains: [mainnet, polygon, sepolia, celo],
            },
            // wagmiProviderProps={}
          },
          cosmosConnector: {
            config: {
              selectedChainId: selectedCosmosChainId,
              multiChain: true,
              onSwitchChain: chainId => {
                updateCosmosState({ selectedChainId: chainId });
              },
              chains: cosmosChains,
            },
            // grazProviderProps={}
          },
          solanaConnector: {
            config: {
              endpoint: endpoint,
              chain: solanaNetwork,
            },
          },
          walletConnect: {
            projectId: 'dc87c564a371d823d3795ae407391656',
          },
        }}
      >
        <Content />
      </ParaProvider>
    </QueryClientProvider>
  );
};
