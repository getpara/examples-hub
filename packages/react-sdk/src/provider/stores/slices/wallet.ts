import { StateCreator } from 'zustand';
import { Store, WalletSlice } from '../types.js';

export const createWalletSlice: StateCreator<Store, [], [], WalletSlice> = set => ({
  selectedWalletId: undefined,
  selectedWalletType: undefined,
  setSelectedWallet: (selectedWalletId, selectedWalletType) => set({ selectedWalletId, selectedWalletType }),
  clearSelectedWallet: () => set({ selectedWalletId: undefined, selectedWalletType: undefined }),
});
