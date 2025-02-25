import { CosmosExternalWalletContextType } from '@getpara/cosmos-wallet-connectors';
import { createContext } from 'react';

export const defaultCosmosExternalWallet = {
  wallets: [],
  chains: [],
  chainId: undefined,
  disconnect: () => Promise.resolve(),
  switchChain: () => Promise.resolve({}),
  connectParaEmbedded: () => Promise.resolve({}),
};

export const CosmosExternalWalletContext = createContext<CosmosExternalWalletContextType>(defaultCosmosExternalWallet);
