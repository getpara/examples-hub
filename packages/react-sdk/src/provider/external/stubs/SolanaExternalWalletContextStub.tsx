import { createContext } from 'react';
import { type SolanaExternalWalletContextType } from '@getpara/solana-wallet-connectors';
import { defaultSolanaExternalWallet } from '@getpara/react-common';

export const SolanaExternalWalletContext = createContext<SolanaExternalWalletContextType>(defaultSolanaExternalWallet);
