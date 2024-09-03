import { StoreApi } from 'zustand';
import { ThemeActions, ThemeStore } from './useThemeStore.js';
import { TAuthLayout } from '../../types/modalProps.js';

export const getActions = (set: StoreApi<ThemeStore>['setState'], get: StoreApi<ThemeStore>['getState']): ThemeActions => ({
  updateState: state => {
    set(state);
  },
  getLogo: () => {
    return get().logo ?? undefined;
  },
  setAuthLayout: authLayout => {
    const types: string[] = [];
    const uniqueLayouts: TAuthLayout[] = [];

    authLayout.map(layout => {
      const type = layout.split(':')[0];

      if (!types.includes(type)) {
        uniqueLayouts.push(layout);

        types.push(type);
      } else {
        console.warn(`${layout} is a duplicate ${type} layout type. Please remove the duplicate type from your config.`);
      }
    });

    set({ authLayout: uniqueLayouts });
  },
});
