import { StateCreator } from 'zustand';
import { ExternalWalletsSlice, Store } from '../types.js';
import { EvmExternalWalletContext } from '../../external/stubs/EvmExternalWalletContextStub.js';
import { CosmosExternalWalletContext } from '../../external/stubs/CosmosExternalWalletContextStub.js';
import { SolanaExternalWalletContext } from '../../external/stubs/SolanaExternalWalletContextStub.js';

export const createExternalWalletsSlice: StateCreator<Store, [], [], ExternalWalletsSlice> = set => ({
  externalWallets: [],
  setExternalWallets: externalWallets => set({ externalWallets }),

  evmContext: EvmExternalWalletContext,
  setEvmContext: evmContext => set({ evmContext }),
  EvmProvider: undefined,
  setEvmProvider: EvmProvider => set({ EvmProvider }),
  evmWallets: [],
  setEvmWallets: evmWallets => set({ evmWallets }),
  isLoadingEvmLib: true,
  setIsLoadingEvmLib: isLoadingEvmLib => set({ isLoadingEvmLib }),

  cosmosContext: CosmosExternalWalletContext,
  setCosmosContext: cosmosContext => set({ cosmosContext }),
  CosmosProvider: undefined,
  setCosmosProvider: CosmosProvider => set({ CosmosProvider }),
  cosmosWallets: [],
  setCosmosWallets: cosmosWallets => set({ cosmosWallets }),
  isLoadingCosmosLib: true,
  setIsLoadingCosmosLib: isLoadingCosmosLib => set({ isLoadingCosmosLib }),

  solanaContext: SolanaExternalWalletContext,
  setSolanaContext: solanaContext => set({ solanaContext }),
  SolanaProvider: undefined,
  setSolanaProvider: SolanaProvider => set({ SolanaProvider }),
  solanaWallets: [],
  setSolanaWallets: solanaWallets => set({ solanaWallets }),
  isLoadingSolanaLib: true,
  setIsLoadingSolanaLib: isLoadingSolanaLib => set({ isLoadingSolanaLib }),
});
