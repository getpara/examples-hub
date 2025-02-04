import { create } from 'zustand';
import { createClientSlice, createModalSlice, createWalletSlice } from './slices/index.js';
import { Store } from './types.js';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useStore = create<Store>()(
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
