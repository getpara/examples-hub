import { type CosmosExternalWalletContextType } from '@getpara/cosmos-wallet-connectors';
import { defaultCosmosExternalWallet } from '@getpara/react-common';
import { createContext } from 'react';

export const CosmosExternalWalletContext = createContext<CosmosExternalWalletContextType>(defaultCosmosExternalWallet);
