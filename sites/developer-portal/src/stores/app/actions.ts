import { StoreApi } from 'zustand';
import { AppStore, DEFAULT_APP_STATE, AppActions, NotificationType } from './useAppStore.js';
import { getClient } from '@getpara/react-sdk';

export const getActions = (set: StoreApi<AppStore>['setState'], get: StoreApi<AppStore>['getState']): AppActions => ({
  resetState: () => {
    set(DEFAULT_APP_STATE);
  },
  setSelectedOrganization: orgId => {
    const para = getClient();
    const userId = para?.getUserId();

    if (!userId) {
      return;
    }

    set({
      userSelectedOrganizationId: {
        ...get().userSelectedOrganizationId,
        [userId]: orgId,
      },
    });
  },
  getSelectedOrganization: (userId?: string) => {
    return get().userSelectedOrganizationId[userId ?? ''];
  },
  dismissNotification: (orgId: string, notificationId: string) => {
    set({
      dismissedNotifications: {
        ...get().dismissedNotifications,
        [orgId]: {
          ...get().dismissedNotifications[orgId],
          [notificationId]: true,
        },
      },
    });
  },
  hasDismissedNotification: (orgId: string, notificationId: string) =>
    get().dismissedNotifications[orgId]?.[notificationId] ?? false,
  dismissOnboardingNotification: (orgId: string, notificationType: NotificationType) => {
    set({
      dismissedNotifications: {
        ...get().dismissedNotifications,
        [orgId]: {
          ...get().dismissedNotifications[orgId],
          [notificationType]: true,
        },
      },
    });
  },
  hasDismissedOnboardingNotification: (orgId: string, notificationType: NotificationType) =>
    get().dismissedNotifications[orgId]?.[notificationType] ?? false,
  setAppBarHeight: appBarHeight => {
    set({ appBarHeight });
  },
});
