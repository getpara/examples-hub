import React, { useMemo } from 'react';
import { useAtom } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
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
import { CapsuleCosmosProvider, leapWallet, keplrWallet } from '@usecapsule/cosmos-wallet-connectors';
import { cosmoshubtestnet } from '@usecapsule/graz/chains';

import { WALLET_CONNECT_PROJECT_ID } from './constants';
import { ModalDesigner } from './components/ModalDesigner';
import { initializeAppAtom } from './atoms';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as JotaiProvider } from 'jotai';
import { defineCustomElements } from '@usecapsule/react-components';

import '@usecapsule/react-components/css/capsule-core.css';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

defineCustomElements();
const solanaNetwork = WalletAdapterNetwork.Devnet;

const queryClient = new QueryClient();

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
          <CapsuleCosmosProvider
            selectedChainId={cosmoshubtestnet.chainId}
            chains={[cosmoshubtestnet]}
            onSwitchChain={() => {}}
            wallets={[leapWallet, keplrWallet]}
            walletConnect={{ options: { projectId: WALLET_CONNECT_PROJECT_ID, name: 'Capsule Modal Builder' } }}
          >
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
          </CapsuleCosmosProvider>
        </QueryClientProvider>
      </JotaiProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
