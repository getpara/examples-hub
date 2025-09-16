import { sepolia, celo, mainnet, polygon, fluentTestnet } from 'wagmi/chains';
import { Content } from './components/Content';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { axelar, cosmoshub, osmosis, sommelier, stargaze } from '@getpara/graz/chains';
import { ParaProvider } from '@getpara/react-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useModalStateStore } from './stores/modalStateStore/useModalStateStore';
import { useCosmosStore } from './stores/cosmosStore/useCosmosStore';
import { useEffect, memo, useMemo, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { ModalConfig } from './components/ModalConfig/ModalConfig';
import { validateBalancesConfig } from '@getpara/core-sdk';
import styled from 'styled-components';

const queryClient = new QueryClient();

// Create optimized selectors to prevent unnecessary re-renders
const useModalConfig = () => {
  return useModalStateStore(state => {
    const displayType = state.balancesDisplayType || 'AGGREGATED';
    const balances: any = {
      displayType,
    };

    if (displayType === 'AGGREGATED') {
      balances.excludeStandardAssets = state.balancesExcludeStandardAssets;
      balances.additionalAssets = state.balancesAdditionalAssets;
    } else if (displayType === 'CUSTOM_ASSET') {
      balances.asset = state.balancesAsset;
    }

    return {
      oAuthMethods: state.oAuthMethods,
      authLayout: state.authLayout,
      theme: {
        mode: state.mode,
        foregroundColor: state.foregroundColor,
        backgroundColor: state.backgroundColor,
        accentColor: state.accentColor,
      },
      logo: state.logo,
      balances,
    };
  });
};

// Create a validated balances config that only updates when valid
const useValidatedBalancesConfig = () => {
  const { balancesDisplayType, balancesExcludeStandardAssets, balancesAdditionalAssets, balancesAsset } = useModalStateStore(
    state => ({
      balancesDisplayType: state.balancesDisplayType,
      balancesExcludeStandardAssets: state.balancesExcludeStandardAssets,
      balancesAdditionalAssets: state.balancesAdditionalAssets,
      balancesAsset: state.balancesAsset,
    }),
  );

  // Only return the config if it's valid, otherwise return undefined
  return useMemo(() => {
    if (!balancesDisplayType) return undefined;

    const config: any = { displayType: balancesDisplayType };

    if (balancesDisplayType === 'AGGREGATED') {
      if (balancesExcludeStandardAssets !== undefined) {
        config.excludeStandardAssets = balancesExcludeStandardAssets;
      }
      if (balancesAdditionalAssets !== undefined) {
        config.additionalAssets = balancesAdditionalAssets;
      }
    } else if (balancesDisplayType === 'CUSTOM_ASSET') {
      if (balancesAsset !== undefined) {
        config.asset = balancesAsset;
      }
    }

    return validateBalancesConfig(config) ? config : undefined;
  }, [balancesDisplayType, balancesExcludeStandardAssets, balancesAdditionalAssets, balancesAsset]);
};

const useExternalWalletConfig = () => {
  return useModalStateStore(state => ({
    externalWallets: state.externalWallets,
    externalWalletConnectionOnly: state.externalWalletConnectionOnly,
    externalWalletIncludeVerification: state.externalWalletIncludeVerification,
    isFullAuth: state.isFullAuth,
  }));
};

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

const ModalConfigContainer = styled.div`
  padding: 16px;
  width: 100%;
  background: var(--cpsl-color-background-16);
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  @media (min-width: 1024px) {
    flex-direction: row;
  }

  @media (max-width: 1023px) {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
`;

const LeftPanel = styled.div`
  flex: 2;
  min-width: 300px;
  max-width: 100%;
  overflow-y: auto;
  border-right: 1px solid var(--cpsl-color-border);
  border-bottom: 1px solid var(--cpsl-color-border);
  order: 3; /* Modal config comes last on mobile */

  @media (min-width: 1024px) {
    border-bottom: none;
    border-right: 1px solid var(--cpsl-color-border);
    min-width: 400px;
    order: 1; /* Left panel first on desktop */
  }

  @media (max-width: 1023px) {
    overflow-y: visible;
  }

  @media (max-width: 640px) {
    min-width: 280px;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  min-width: 280px;
  max-width: 100%;
  overflow-y: auto;
  background: var(--cpsl-color-background-16);
  order: 2; /* Content second on mobile */

  @media (min-width: 1024px) {
    min-width: 460px; /* Enforce minimum width on desktop */
    order: 2; /* Right panel second on desktop */
  }

  @media (max-width: 1023px) {
    overflow-y: visible;
  }

  @media (max-width: 640px) {
    min-width: 250px;
  }
`;

export const App = memo(() => {
  const modalConfig = useModalConfig();
  const validatedBalancesConfig = useValidatedBalancesConfig();
  const externalWalletConfig = useExternalWalletConfig();
  const farcasterDisableAutoConnect = useModalStateStore(state => state.farcasterDisableAutoConnect);
  const selectedCosmosChainId = useCosmosStore(state => state.selectedChainId);
  const updateCosmosState = useCosmosStore(state => state.updateState);

  // Track the last configuration that caused a reload to prevent infinite loops
  const [lastReloadedConfig, setLastReloadedConfig] = useState<string | null>(() => {
    return sessionStorage.getItem('lastReloadedBalancesConfig');
  });

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  // Reload page when a new valid balances configuration is detected
  useEffect(() => {
    if (validatedBalancesConfig) {
      const configString = JSON.stringify(validatedBalancesConfig);

      if (process.env.NODE_ENV === 'development') {
        console.log('Reload effect triggered:', {
          hasConfig: !!validatedBalancesConfig,
          configString,
          lastReloadedConfig,
          isDifferent: lastReloadedConfig !== configString,
        });
      }

      // Only reload if this is a different configuration than the last one
      if (lastReloadedConfig !== configString) {
        if (process.env.NODE_ENV === 'development') {
          console.log('New valid balances configuration detected, reloading page...');
        }
        setLastReloadedConfig(configString);
        sessionStorage.setItem('lastReloadedBalancesConfig', configString);
        // window.location.reload();
      }
    } else {
      console.log('No validated config, skipping reload');
    }
  }, [validatedBalancesConfig, lastReloadedConfig, setLastReloadedConfig]);

  // Debug logging for balances config validation
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Balances config validation:', {
        rawConfig: modalConfig.balances,
        validatedConfig: validatedBalancesConfig,
        isValid: !!validatedBalancesConfig,
      });
    }
  }, [modalConfig.balances, validatedBalancesConfig]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContainer>
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
            oAuthMethods: modalConfig.oAuthMethods,
            authLayout: modalConfig.authLayout,
            theme: modalConfig.theme,
            logo: modalConfig.logo,
            onRampTestMode: true,
            isGuestModeEnabled: true,
            balances: validatedBalancesConfig,
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
            connectionOnly: externalWalletConfig.externalWalletConnectionOnly,
            includeWalletVerification: externalWalletConfig.externalWalletIncludeVerification,
            wallets: externalWalletConfig.externalWallets,
            createLinkedEmbeddedForExternalWallets: externalWalletConfig.isFullAuth ? 'ALL' : undefined,
            // appDescription
            // appIcon
            // appUrl
            evmConnector: {
              config: {
                chains: [mainnet, polygon, sepolia, celo, fluentTestnet],
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
          {/* Desktop Layout */}
          <RightPanel>
            <Content />
          </RightPanel>

          {/* Modal Config - always last */}
          <LeftPanel>
            <ModalConfigContainer>
              <ModalConfig />
            </ModalConfigContainer>
          </LeftPanel>
        </ParaProvider>
      </AppContainer>
    </QueryClientProvider>
  );
});
