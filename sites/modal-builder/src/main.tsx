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
import {
  ParaEvmProvider,
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  zerionWallet,
  rabbyWallet,
} from '@getpara/evm-wallet-connectors';
import { backpackWallet, ParaSolanaProvider, glowWallet, phantomWallet } from '@getpara/solana-wallet-connectors';
import { ParaCosmosProvider, leapWallet, keplrWallet } from '@getpara/cosmos-wallet-connectors';
import { axelar, cosmoshub, osmosis, sommelier, stargaze } from '@getpara/graz/chains';

import { WALLET_CONNECT_PROJECT_ID } from './constants';
import { ModalDesigner } from './components/ModalDesigner';
import { initializeAppAtom } from './atoms';

import '@getpara/react-components/css/capsule-core.css';
import './index.css';

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
    name: 'Para Example',
    uri: `${location.protocol}//${location.host}`,
  },
};

defineCustomElements();
const queryClient = new QueryClient();

const App = () => {
  useHydrateAtoms([[initializeAppAtom, null]]);
  const [, initialize] = useAtom(initializeAppAtom);
  const [selectedCosmosChain, setSelectedCosmosChain] = useState(cosmoshub.chainId);
  const endpoint = useMemo(() => clusterApiUrl(SOLANA_NETWORK), [SOLANA_NETWORK]);

  React.useEffect(() => {
    initialize(null);
  }, [initialize]);

  return (
    <BrowserRouter>
      <JotaiProvider>
        <QueryClientProvider client={queryClient}>
          <ParaCosmosProvider
            selectedChainId={selectedCosmosChain}
            chains={COSMOS_WALLET_CONFIG.chains}
            onSwitchChain={setSelectedCosmosChain}
            wallets={COSMOS_WALLET_CONFIG.wallets}
            walletConnect={{
              options: COSMOS_WALLET_CONFIG.walletConnectOptions,
            }}
          >
            <ParaEvmProvider config={EVM_WALLET_CONFIG}>
              <ParaSolanaProvider
                endpoint={endpoint}
                wallets={SOLANA_WALLET_CONFIG.wallets}
                chain={SOLANA_NETWORK}
                appIdentity={SOLANA_WALLET_CONFIG.appIdentity}
              >
                <ModalDesigner />
              </ParaSolanaProvider>
            </ParaEvmProvider>
          </ParaCosmosProvider>
        </QueryClientProvider>
      </JotaiProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
