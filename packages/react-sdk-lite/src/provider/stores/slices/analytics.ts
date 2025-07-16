import { StateCreator } from 'zustand';
import { AnalyticsSlice, Store } from '../types.js';

export const createAnalyticsSlice: StateCreator<Store, [], [], AnalyticsSlice> = set => ({
  providerProps: {},
  setProviderProps: providerProps => set({ providerProps }),
});
