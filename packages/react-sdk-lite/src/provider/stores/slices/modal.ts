import { StateCreator } from 'zustand';
import { ModalSlice, Store } from '../types.js';
import { createRef } from 'react';
import { ModalStep } from '../../../modal/index.js';

export const createModalSlice: StateCreator<Store, [], [], ModalSlice> = set => ({
  modalConfig: undefined,
  setModalConfig: modalConfig =>
    set({
      modalConfig,
      isDarkTheme: modalConfig?.theme?.mode === 'dark',
      oAuthLogoVariant: modalConfig?.theme?.oAuthLogoVariant ?? 'default',
    }),

  isDarkTheme: false,
  oAuthLogoVariant: 'default',

  isOpen: false,
  setIsOpen: isOpen => set({ isOpen }),

  openedToStep: createRef<ModalStep | null>(),
});
