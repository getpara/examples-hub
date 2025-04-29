import React, { useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as JotaiProvider } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineCustomElements } from '@getpara/react-components';
import { sepolia } from 'wagmi/chains';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { axelar, cosmoshub, osmosis, sommelier, stargaze } from '@getpara/graz/chains';

import { PARA_API_KEY, PARA_ENVIRONMENT, WALLET_CONNECT_PROJECT_ID } from './constants';
import { ModalDesigner } from './components/ModalDesigner';
import { initializeAppAtom, modalConfigAtom, viewAtom } from './atoms';

import '@getpara/react-components/css/capsule-core.css';
import './index.css';
import { ParaProvider } from '@getpara/react-sdk';
import { PlaceHolderLogo } from './assets';
import { calculateBrightness } from './utils';

const APP_NAME = 'Para Modal Builder';
const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;

export const COSMOS_CHAINS = [
  { ...cosmoshub, rpc: 'https://rpc.cosmos.directory/cosmoshub', rest: 'https://rest.cosmos.directory/cosmoshub' },
  { ...sommelier, rpc: 'https://rpc.cosmos.directory/sommelier', rest: 'https://rest.cosmos.directory/sommelier' },
  { ...stargaze, rpc: 'https://rpc.cosmos.directory/stargaze', rest: 'https://rest.cosmos.directory/stargaze' },
  { ...axelar, rpc: 'https://rpc.cosmos.directory/axelar', rest: 'https://rest.cosmos.directory/axelar' },
  { ...osmosis, rpc: 'https://rpc.cosmos.directory/osmosis', rest: 'https://rest.cosmos.directory/osmosis' },
];

const COSMOS_WALLET_CONFIG = {
  chains: COSMOS_CHAINS,
};

const EVM_WALLET_CONFIG = {
  chains: [sepolia] as const,
};

const SOLANA_WALLET_CONFIG = {
  endpoint: clusterApiUrl(SOLANA_NETWORK),
  chain: SOLANA_NETWORK,
  appIdentity: {
    name: 'Para Example',
    uri: `${location.protocol}//${location.host}`,
  },
};

defineCustomElements();
const queryClient = new QueryClient();

const App = () => {
  const [selectedCosmosChain, setSelectedCosmosChain] = useState(cosmoshub.chainId);
  const [modalConfig] = useAtom(modalConfigAtom);
  const [view] = useAtom(viewAtom);

  const paraClientConfig = useMemo(
    () => ({
      env: PARA_ENVIRONMENT,
      apiKey: PARA_API_KEY,
    }),
    [PARA_ENVIRONMENT, PARA_API_KEY],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        config={{ disableEmbeddedModal: true, appName: APP_NAME, rpcUrl: 'https://sepolia.drpc.org' }}
        paraClientConfig={paraClientConfig}
        externalWalletConfig={{
          wallets: modalConfig.authentication.externalWallets ?? [],
          walletConnect: { projectId: WALLET_CONNECT_PROJECT_ID },
          cosmosConnector: {
            config: {
              selectedChainId: selectedCosmosChain,
              onSwitchChain: setSelectedCosmosChain,
              ...COSMOS_WALLET_CONFIG,
            },
          },
          evmConnector: {
            config: EVM_WALLET_CONFIG,
          },
          solanaConnector: {
            config: SOLANA_WALLET_CONFIG,
          },
        }}
        paraModalConfig={{
          bareModal: true,
          isOpen: true,
          logo: modalConfig.appearance.logo || PlaceHolderLogo,
          theme: {
            ...modalConfig.appearance.theme,
            mode: calculateBrightness(modalConfig.appearance.theme.backgroundColor || '#ffffff') > 0.5 ? 'light' : 'dark',
            font: modalConfig.appearance.theme.font ?? 'Inter',
          },
          oAuthMethods: modalConfig.authentication.oAuthMethods,
          disableEmailLogin: modalConfig.authentication.disableEmailLogin,
          disablePhoneLogin: modalConfig.authentication.disablePhoneLogin,
          authLayout: modalConfig.authentication.authLayout,
          twoFactorAuthEnabled: modalConfig.security.twoFactorAuthEnabled,
          recoverySecretStepEnabled: modalConfig.security.recoverySecretStepEnabled,
          hideWallets: modalConfig.wallets.hideWallets,
          onRampTestMode: modalConfig.onRamps.onRampTestMode,
          className: view === 'mobile' ? 'force-mobile-media include-mobile-styling' : '',
          isGuestModeEnabled: !!modalConfig.authentication.isGuestModeEnabled,
        }}
      >
        <ModalDesigner />
      </ParaProvider>
    </QueryClientProvider>
  );
};

const AppWrapper = () => {
  useHydrateAtoms([[initializeAppAtom, null]]);
  const [, initialize] = useAtom(initializeAppAtom);

  React.useEffect(() => {
    initialize(null);
  }, [initialize]);

  return (
    <BrowserRouter>
      <JotaiProvider>
        <App />
      </JotaiProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<AppWrapper />);
