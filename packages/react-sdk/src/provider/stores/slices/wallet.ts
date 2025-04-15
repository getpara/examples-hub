import { StateCreator } from 'zustand';
import { Store, WalletSlice } from '../types.js';

export const createWalletSlice: StateCreator<Store, [], [], WalletSlice> = set => ({
  rpcUrl: undefined,
  setRpcUrl: rpcUrl => set({ rpcUrl }),

  selectedWalletId: undefined,
  selectedWalletType: undefined,
  setSelectedWallet: (selectedWalletId, selectedWalletType) => set({ selectedWalletId, selectedWalletType }),
  clearSelectedWallet: () => set({ selectedWalletId: undefined, selectedWalletType: undefined }),
});
