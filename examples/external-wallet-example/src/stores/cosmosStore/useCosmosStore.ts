import { cosmoshub } from '@getpara/graz/chains';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CosmosState {
  selectedChainId: string;
}

export interface CosmosActions {
  updateState: (state: Partial<CosmosState>) => void;
}

export type CosmosStore = CosmosState & CosmosActions;

const DEFAULT_STATE: CosmosState = {
  selectedChainId: cosmoshub.chainId,
};

export const useCosmosStore = create<CosmosStore>()(
  persist(
    set => ({
      ...DEFAULT_STATE,
      updateState: state => set(state),
    }),
    {
      version: 2,
      name: '@PARA_EXAMPLE_APP/cosmosStore',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({
        selectedChainId: state.selectedChainId,
      }),
    },
  ),
);
