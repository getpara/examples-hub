import { StoreApi } from 'zustand';
import { AppStore, DEFAULT_APP_STATE, AppActions } from './useAppStore.js';
import { para } from '../../clients/para.js';

export const getActions = (set: StoreApi<AppStore>['setState'], get: StoreApi<AppStore>['getState']): AppActions => ({
  resetState: () => {
    set(DEFAULT_APP_STATE);
  },
  setSelectedOrganization: orgId => {
    const userId = para.getUserId();

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
});
