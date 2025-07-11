import { StateCreator } from 'zustand';
import { ConfigSlice, Store } from '../types.js';

export const createConfigSlice: StateCreator<Store, [], [], ConfigSlice> = set => ({
  appName: '',
  setAppName: appName => set({ appName }),

  farcasterMiniAppConfig: undefined,
  setFarcasterMiniAppConfig: farcasterMiniAppConfig => set({ farcasterMiniAppConfig }),
});
