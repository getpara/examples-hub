import { StateCreator } from 'zustand';
import { ModalSlice, Store } from '../types.js';

export const createModalSlice: StateCreator<Store, [], [], ModalSlice> = (set, get) => ({
  modalConfig: undefined,
  setModalConfig: modalConfig => set({ modalConfig }),

  isDarkTheme: get()?.modalConfig?.theme?.mode === 'dark',
  oAuthLogoVariant: get()?.modalConfig?.theme?.oAuthLogoVariant ?? 'default',

  isOpen: false,
  setIsOpen: isOpen => set({ isOpen }),
});
