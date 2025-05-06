import { StoreApi } from 'zustand';
import { AppStore, DEFAULT_APP_STATE, AppActions } from './useAppStore.js';
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
      clearedNotifications: {
        ...get().clearedNotifications,
        [orgId]: {
          ...get().clearedNotifications[orgId],
          [notificationId]: true,
        },
      },
    });
  },
  hasDismissedNotification: (orgId: string, notificationId: string) =>
    get().clearedNotifications[orgId]?.[notificationId] ?? false,
});
