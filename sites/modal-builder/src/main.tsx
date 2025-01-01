import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as JotaiProvider } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { defineCustomElements } from '@usecapsule/react-components';
import { sepolia } from 'wagmi/chains';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import {
  CapsuleEvmProvider,
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  zerionWallet,
  rabbyWallet,
} from '@usecapsule/evm-wallet-connectors';
import { backpackWallet, CapsuleSolanaProvider, glowWallet, phantomWallet } from '@usecapsule/solana-wallet-connectors';
import { CapsuleCosmosProvider, leapWallet, keplrWallet } from '@usecapsule/cosmos-wallet-connectors';
import { cosmoshubtestnet } from '@usecapsule/graz/chains';

import { WALLET_CONNECT_PROJECT_ID } from './constants';
import { ModalDesigner } from './components/ModalDesigner';
import { initializeAppAtom } from './atoms';

import '@usecapsule/react-components/css/capsule-core.css';
import './index.css';

const APP_NAME = 'Capsule Modal Builder';
const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;

const COSMOS_WALLET_CONFIG = {
  chains: [cosmoshubtestnet],
  wallets: [leapWallet, keplrWallet],
  walletConnectOptions: {
    projectId: WALLET_CONNECT_PROJECT_ID,
    name: APP_NAME,
  },
};

const EVM_WALLET_CONFIG = {
  projectId: WALLET_CONNECT_PROJECT_ID,
  appName: APP_NAME,
  chains: [sepolia] as const,
  wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, zerionWallet, coinbaseWallet, rabbyWallet],
};

const SOLANA_WALLET_CONFIG = {
  wallets: [glowWallet, phantomWallet, backpackWallet],
  appIdentity: {
    name: 'Capsule Example',
    uri: `${location.protocol}//${location.host}`,
  },
};

defineCustomElements();
const queryClient = new QueryClient();

const App = () => {
  useHydrateAtoms([[initializeAppAtom, null]]);
  const [, initialize] = useAtom(initializeAppAtom);
  const endpoint = useMemo(() => clusterApiUrl(SOLANA_NETWORK), [SOLANA_NETWORK]);

  React.useEffect(() => {
    initialize(null);
  }, [initialize]);

  return (
    <BrowserRouter>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>
          <CapsuleCosmosProvider
            selectedChainId={cosmoshubtestnet.chainId}
            chains={COSMOS_WALLET_CONFIG.chains}
            onSwitchChain={() => {}}
            wallets={COSMOS_WALLET_CONFIG.wallets}
            walletConnect={{
              options: COSMOS_WALLET_CONFIG.walletConnectOptions,
            }}
          >
            <CapsuleEvmProvider config={EVM_WALLET_CONFIG}>
              <CapsuleSolanaProvider
                endpoint={endpoint}
                wallets={SOLANA_WALLET_CONFIG.wallets}
                chain={SOLANA_NETWORK}
                appIdentity={SOLANA_WALLET_CONFIG.appIdentity}
              >
                <ModalDesigner />
              </CapsuleSolanaProvider>
            </CapsuleEvmProvider>
          </CapsuleCosmosProvider>
        </QueryClientProvider>
      </JotaiProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
