import { CosmosExternalWalletContextType, defaultCosmosExternalWallet } from '@getpara/cosmos-wallet-connectors';
import { createContext } from 'react';

export const CosmosExternalWalletContext = createContext<CosmosExternalWalletContextType>(defaultCosmosExternalWallet);
