import {
  CapsuleEvmProvider,
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  zerionWallet,
} from '@usecapsule/evm-wallet-connectors';
import { CapsuleCosmosProvider, keplrWallet, leapWallet } from '@usecapsule/cosmos-wallet-connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sepolia, celo, mainnet, polygon } from 'wagmi/chains';
import { Content } from './components/Content';
import { CapsuleSolanaProvider, glowWallet, phantomWallet } from '@usecapsule/solana-wallet-connectors';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useMemo } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import { Network } from '@delphi-labs/shuttle';
import { useCosmosStore } from './stores/cosmosStore/useCosmosStore';

const queryClient = new QueryClient();

const cosmosChains: Network[] = [
  {
    name: 'Mars Hub',
    chainId: 'mars-1',
    chainPrefix: 'mars',
    rpc: 'https://rpc.marsprotocol.io/',
    rest: 'https://rest.marsprotocol.io/',
    defaultCurrency: {
      coinDenom: 'MARS',
      coinMinimalDenom: 'umars',
      coinDecimals: 6,
      coinGeckoId: 'mars',
    },
    gasPrice: '0.015umars',
  },
  {
    name: 'Neutron Testnet',
    chainId: 'pion-1',
    chainPrefix: 'neutron',
    rpc: 'https://rpc-palvus.pion-1.ntrn.tech/',
    rest: 'https://rest-palvus.pion-1.ntrn.tech/',
    defaultCurrency: {
      coinDenom: 'NTRN',
      coinMinimalDenom: 'untrn',
      coinDecimals: 6,
    },
    gasPrice: '0.025untrn',
  },
];

const solanaNetwork = WalletAdapterNetwork.Devnet;

export const App = () => {
  const selectedCosmosChainId = useCosmosStore(state => state.selectedChainId);
  const updateCosmosState = useCosmosStore(state => state.updateState);

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(solanaNetwork), [solanaNetwork]);

  return (
    <QueryClientProvider client={queryClient}>
      <CapsuleCosmosProvider
        selectedChainId={selectedCosmosChainId}
        walletConnectProjectId="dc87c564a371d823d3795ae407391656"
        chains={cosmosChains}
        wallets={[keplrWallet, leapWallet]}
        onSwitchChain={chainId => {
          updateCosmosState({ selectedChainId: chainId });
        }}
      >
        <CapsuleEvmProvider
          config={{
            projectId: 'dc87c564a371d823d3795ae407391656',
            appName: 'Capsule Example',
            chains: [mainnet, polygon, sepolia, celo],
            wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, zerionWallet, coinbaseWallet],
          }}
        >
          <CapsuleSolanaProvider endpoint={endpoint} wallets={[glowWallet, phantomWallet]}>
            <Content />
          </CapsuleSolanaProvider>
        </CapsuleEvmProvider>
      </CapsuleCosmosProvider>
    </QueryClientProvider>
  );
};
