import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getActions } from './actions.js';

type NotificationType = 'providerMigration';

interface AppState {
  userSelectedOrganizationId: { [k: string]: string | undefined };
  clearedNotifications: {
    [k: string]: {
      [k: string]: boolean;
    };
  };
}

export interface AppActions {
  resetState: () => void;
  setSelectedOrganization: (orgId?: string) => void;
  getSelectedOrganization: (_?: string) => string | undefined;

  dismissNotification: (orgId: string, notificationType: NotificationType) => void;
  hasDismissedNotification: (orgId: string, notificationType: NotificationType) => boolean;
}

export type AppStore = AppState & AppActions;

export const DEFAULT_APP_STATE: AppState = {
  userSelectedOrganizationId: {},
  clearedNotifications: {},
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
        clearedNotifications: state.clearedNotifications,
      }),
    },
  ),
);
