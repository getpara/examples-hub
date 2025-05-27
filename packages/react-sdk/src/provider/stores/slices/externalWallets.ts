import { StateCreator } from 'zustand';
import { ExternalWalletsSlice, Store } from '../types.js';
import { EvmExternalWalletContext } from '../../external/stubs/EvmExternalWalletContextStub.js';
import { CosmosExternalWalletContext } from '../../external/stubs/CosmosExternalWalletContextStub.js';
import { SolanaExternalWalletContext } from '../../external/stubs/SolanaExternalWalletContextStub.js';
import { createRef } from 'react';

export const createExternalWalletsSlice: StateCreator<Store, [], [], ExternalWalletsSlice> = set => ({
  externalWallets: [],
  setExternalWallets: externalWallets => set({ externalWallets }),

  externalWalletsWithFullAuth: [],
  setExternalWalletsWithFullAuth: externalWalletsWithFullAuth => set({ externalWalletsWithFullAuth }),

  includeWalletVerification: false,
  setIncludeWalletVerification: includeWalletVerification => set({ includeWalletVerification }),

  connectionOnly: false,
  setConnectionOnly: connectionOnly => set({ connectionOnly }),

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

  onLoginRef: createRef<(() => Promise<void>) | null>(),
});
