import { StateCreator } from 'zustand';
import { ClientSlice, Store } from '../types.js';

export const createClientSlice: StateCreator<Store, [], [], ClientSlice> = set => ({
  client: undefined,
  setClient: client => set({ client }),
});
