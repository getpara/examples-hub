import { StoreApi } from 'zustand';
import { ThemeActions, ThemeStore } from './useThemeStore';
import { Theme } from '../../types/theme';

export const getActions = (
  set: StoreApi<ThemeStore>['setState'],
  get: StoreApi<ThemeStore>['getState'],
): ThemeActions => ({
  updateState: (state) => {
    set(state);
  },
  getLogo: () => {
    const theme = get().theme;

    return theme === Theme.dark
      ? get().logoDark ?? get().logo ?? undefined
      : get().logo ?? undefined;
  },
});
