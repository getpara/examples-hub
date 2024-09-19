import { create } from 'zustand';
import { getActions } from './actions.js';
import { EvmExternalWalletContextType, EvmExternalWalletProvider } from '../../providers/EvmExternalWalletContextStub.js';
import { Context } from 'react';
import {
  SolanaExternalWalletContextType,
  SolanaExternalWalletProvider,
} from '../../providers/SolanaExternalWalletContextStub.js';
import {
  CosmosExternalWalletContextType,
  CosmosExternalWalletProvider,
} from '../../providers/CosmosExternalWalletContextStub.js';

interface ExternalWalletProviderState {
  EvmProvider?: typeof EvmExternalWalletProvider;
  evmContext?: Context<EvmExternalWalletContextType>;
  SolanaProvider?: typeof SolanaExternalWalletProvider;
  solanaContext?: Context<SolanaExternalWalletContextType>;
  CosmosProvider?: typeof CosmosExternalWalletProvider;
  cosmosContext?: Context<CosmosExternalWalletContextType>;
}

export interface ExternalWalletProviderActions {
  updateState: (state: Partial<ExternalWalletProviderState>) => void;
}

export type ExternalWalletProviderStore = ExternalWalletProviderState & ExternalWalletProviderActions;

const DEFAULT_EX_WALLET_PROVIDER_STATE: ExternalWalletProviderState = {
  EvmProvider: undefined,
  evmContext: undefined,
  SolanaProvider: undefined,
  solanaContext: undefined,
  CosmosProvider: undefined,
  cosmosContext: undefined,
};

export const useExternalWalletProviderStore = create<ExternalWalletProviderStore>(set => ({
  ...DEFAULT_EX_WALLET_PROVIDER_STATE,
  ...getActions(set),
}));
