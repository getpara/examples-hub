import { useStore } from './useStore.js';

export const getClient = () => useStore().client;
export const getIsOpen = () => useStore().isOpen;
export const getSelectedWalletId = () => useStore().selectedWalletId;
export const getSelectedWalletType = () => useStore().selectedWalletType;
