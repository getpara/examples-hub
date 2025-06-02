import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getActions } from './actions.js';

export type NotificationType = 'providerMigration' | 'logo';

interface AppState {
  userSelectedOrganizationId: { [k: string]: string | undefined };
  dismissedNotifications: {
    [k: string]: {
      [k: string]: boolean;
    };
  };
  dismissedOnboardingNotifications: {
    [k: string]: {
      [k: string]: boolean;
    };
  };
}

export interface AppActions {
  resetState: () => void;
  setSelectedOrganization: (orgId?: string) => void;
  getSelectedOrganization: (_?: string) => string | undefined;

  dismissNotification: (orgId: string, notificationId: string) => void;
  hasDismissedNotification: (orgId: string, notificationId: string) => boolean;

  dismissOnboardingNotification: (orgId: string, notificationType: NotificationType) => void;
  hasDismissedOnboardingNotification: (orgId: string, notificationType: NotificationType) => boolean;
}

export type AppStore = AppState & AppActions;

export const DEFAULT_APP_STATE: AppState = {
  userSelectedOrganizationId: {},
  dismissedNotifications: {},
  dismissedOnboardingNotifications: {},
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
        dismissedNotifications: state.dismissedNotifications,
        dismissedOnboardingNotifications: state.dismissedOnboardingNotifications,
      }),
      version: 1,
    },
  ),
);
