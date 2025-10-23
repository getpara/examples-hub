import { createContext } from 'react';
import { type EvmExternalWalletContextType } from '@getpara/evm-wallet-connectors';
import { defaultEvmExternalWallet } from '@getpara/react-common';

export const EvmExternalWalletContext = createContext<EvmExternalWalletContextType>(
  defaultEvmExternalWallet as EvmExternalWalletContextType,
);
