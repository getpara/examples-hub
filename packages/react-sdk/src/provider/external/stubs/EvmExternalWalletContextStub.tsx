import { createContext } from 'react';
import { defaultEvmExternalWallet, EvmExternalWalletContextType } from '@getpara/evm-wallet-connectors';

export const EvmExternalWalletContext = createContext<EvmExternalWalletContextType>(defaultEvmExternalWallet);
