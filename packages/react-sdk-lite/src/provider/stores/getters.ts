import { vanillaStore } from './useStore.js';

export const getClient = () => vanillaStore.getState().client;
export const getIsOpen = () => vanillaStore.getState().isOpen;
export const getSelectedWalletId = () => vanillaStore.getState().selectedWalletId;
export const getSelectedWalletType = () => vanillaStore.getState().selectedWalletType;
