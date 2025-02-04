import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getActions } from './actions.js';

interface AppState {
  userSelectedOrganizationId: { [k: string]: string | undefined };
}

export interface AppActions {
  resetState: () => void;
  setSelectedOrganization: (orgId?: string) => void;
  getSelectedOrganization: (_?: string) => string | undefined;
}

export type AppStore = AppState & AppActions;

export const DEFAULT_APP_STATE: AppState = {
  userSelectedOrganizationId: {},
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_APP_STATE,
      ...getActions(set, get),
    }),
    {
      name: '@PARA-DEVELOPER-PORTAL/appState',
      partialize: state => ({
        userSelectedOrganizationId: state.userSelectedOrganizationId,
      }),
    },
  ),
);
