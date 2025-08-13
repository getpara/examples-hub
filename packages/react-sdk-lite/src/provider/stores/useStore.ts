import { createStore, StoreApi, useStore as useZustandStore } from 'zustand';
import {
  createAnalyticsSlice,
  createClientSlice,
  createExternalWalletsSlice,
  createModalSlice,
  createWalletSlice,
} from './slices/index.js';
import { Store } from './types.js';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createConfigSlice } from './slices/config.js';
import { PARA_STORAGE_PREFIX } from '@getpara/core-sdk';

export const vanillaStore = createStore<Store>()(
  persist<Store, [], [], Pick<Store, 'selectedWalletId' | 'selectedWalletType'>>(
    (...a) => ({
      ...createClientSlice(...a),
      ...createModalSlice(...a),
      ...createWalletSlice(...a),
      ...createExternalWalletsSlice(...a),
      ...createConfigSlice(...a),
      ...createAnalyticsSlice(...a),
    }),
    {
      version: 1,
      name: `${PARA_STORAGE_PREFIX}provider-state`,
      storage: createJSONStorage(() => localStorage),
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
