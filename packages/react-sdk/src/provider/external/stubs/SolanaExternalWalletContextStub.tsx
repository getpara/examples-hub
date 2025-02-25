import { createContext } from 'react';
import { SolanaExternalWalletContextType } from '@getpara/solana-wallet-connectors';

export const defaultSolanaExternalWallet = {
  wallets: [],
  disconnect: () => Promise.resolve(),
};

export const SolanaExternalWalletContext = createContext<SolanaExternalWalletContextType>(defaultSolanaExternalWallet);
