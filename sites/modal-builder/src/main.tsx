import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
} from '@usecapsule/evm-wallet-connectors';
import { backpackWallet, CapsuleSolanaProvider, glowWallet, phantomWallet } from '@usecapsule/solana-wallet-connectors';

import { WALLET_CONNECT_PROJECT_ID } from './constants';
import { ModalDesigner } from './components/ModalDesigner';
import { initializeAppAtom } from './atoms';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as JotaiProvider } from 'jotai';
import { defineCustomElements } from '@usecapsule/react-components';

import '@usecapsule/react-components/css/capsule-core.css';
import './index.css';

const queryClient = new QueryClient();
defineCustomElements();
const solanaNetwork = WalletAdapterNetwork.Devnet;

const App = () => {
  useHydrateAtoms([[initializeAppAtom, null]]);
  const [, initialize] = useAtom(initializeAppAtom);
  const endpoint = useMemo(() => clusterApiUrl(solanaNetwork), [solanaNetwork]);

  React.useEffect(() => {
    initialize(null);
  }, [initialize]);

  return (
    <BrowserRouter>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>
          <CapsuleEvmProvider
            config={{
              projectId: WALLET_CONNECT_PROJECT_ID,
              appName: 'Capsule Modal Builder',
              chains: [sepolia],
              wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, zerionWallet, coinbaseWallet],
            }}
          >
            <CapsuleSolanaProvider
              endpoint={endpoint}
              wallets={[glowWallet, phantomWallet, backpackWallet]}
              chain={solanaNetwork}
              appIdentity={{ name: 'Capsule Example', uri: `${location.protocol}//${location.host}` }}
            >
              <ModalDesigner />
            </CapsuleSolanaProvider>
          </CapsuleEvmProvider>
        </QueryClientProvider>
      </JotaiProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
