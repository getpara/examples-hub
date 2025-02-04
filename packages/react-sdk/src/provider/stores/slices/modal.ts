import { StateCreator } from 'zustand';
import { ModalSlice, Store } from '../types.js';

export const createModalSlice: StateCreator<Store, [], [], ModalSlice> = set => ({
  isOpen: false,
  setIsOpen: isOpen => set({ isOpen }),
});
