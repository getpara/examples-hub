import { createContext } from 'react';
import { defaultSolanaExternalWallet, SolanaExternalWalletContextType } from '@getpara/solana-wallet-connectors';

export const SolanaExternalWalletContext = createContext<SolanaExternalWalletContextType>(defaultSolanaExternalWallet);
