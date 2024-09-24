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
  selectedChainId: 'mars-1',
};

export const useCosmosStore = create<CosmosStore>()(
  persist(
    set => ({
      ...DEFAULT_STATE,
      updateState: state => set(state),
    }),
    {
      version: 1,
      name: '@CAPSULE_EXAMPLE_APP/cosmosStore',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({
        selectedChainId: state.selectedChainId,
      }),
    },
  ),
);
