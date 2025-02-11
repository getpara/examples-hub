import { createStore, StoreApi, useStore as useZustandStore } from 'zustand';
import { createClientSlice, createModalSlice, createWalletSlice } from './slices/index.js';
import { Store } from './types.js';
import { createJSONStorage, persist } from 'zustand/middleware';

export const vanillaStore = createStore<Store>()(
  persist<Store, [], [], Pick<Store, 'selectedWalletId' | 'selectedWalletType'>>(
    (...a) => ({
      ...createClientSlice(...a),
      ...createModalSlice(...a),
      ...createWalletSlice(...a),
    }),
    {
      version: 1,
      name: '@PARA/web-state',
      storage: createJSONStorage(() => sessionStorage),
      partialize: state => ({
        selectedWalletId: state.selectedWalletId,
        selectedWalletType: state.selectedWalletType,
      }),
    },
  ),
);

const createBoundedUseStore = (store => selector => useZustandStore(store, selector)) as <S extends StoreApi<unknown>>(
  store: S,
) => {
  (): ExtractState<S>;
  <T>(selector: (state: ExtractState<S>) => T): T;
};

type ExtractState<S> = S extends { getState: () => infer X } ? X : never;

export const useStore = createBoundedUseStore(vanillaStore);
