import { StoreApi } from 'zustand';
import { ThemeActions, ThemeStore } from './useThemeStore.js';

export const getActions = (set: StoreApi<ThemeStore>['setState'], get: StoreApi<ThemeStore>['getState']): ThemeActions => ({
  updateState: state => {
    set(state);
  },
  getLogo: () => {
    return get().logo ?? undefined;
  },
});
