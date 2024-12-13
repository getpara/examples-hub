import {
  CapsuleEvmProvider,
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
  zerionWallet,
  rabbyWallet,
} from '@usecapsule/evm-wallet-connectors';
import { CapsuleCosmosProvider, keplrWallet, leapWallet } from '@usecapsule/cosmos-wallet-connectors';
import { sepolia, celo, mainnet, polygon } from 'wagmi/chains';
import { Content } from './components/Content';
import { backpackWallet, CapsuleSolanaProvider, glowWallet, phantomWallet } from '@usecapsule/solana-wallet-connectors';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useMemo } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import { useCosmosStore } from './stores/cosmosStore/useCosmosStore';
import { axelar, cosmoshub, osmosis, sommelier, stargaze } from '@usecapsule/graz/chains';

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
    <CapsuleCosmosProvider
      selectedChainId={selectedCosmosChainId}
      chains={cosmosChains}
      wallets={[keplrWallet, leapWallet]}
      onSwitchChain={chainId => {
        updateCosmosState({ selectedChainId: chainId });
      }}
      multiChain
      walletConnect={{ options: { projectId: 'dc87c564a371d823d3795ae407391656' } }}
    >
      <CapsuleEvmProvider
        config={{
          projectId: 'dc87c564a371d823d3795ae407391656',
          appName: 'Capsule Example',
          chains: [mainnet, polygon, sepolia, celo],
          wallets: [metaMaskWallet, rainbowWallet, walletConnectWallet, zerionWallet, coinbaseWallet, rabbyWallet],
        }}
      >
        <CapsuleSolanaProvider
          endpoint={endpoint}
          wallets={[glowWallet, phantomWallet, backpackWallet]}
          chain={solanaNetwork}
          // Refer to https://docs.solanamobile.com/reference/typescript/mobile-wallet-adapter#web3mobilewalletauthorize for how appIdentity fields work
          appIdentity={{ name: 'Capsule Example', uri: `${location.protocol}//${location.host}` }}
        >
          <Content />
        </CapsuleSolanaProvider>
      </CapsuleEvmProvider>
    </CapsuleCosmosProvider>
  );
};
