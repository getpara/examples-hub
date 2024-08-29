import { StoreApi } from 'zustand';
import { AppStore, DEFAULT_APP_STATE, AppActions } from './useAppStore.js';
import { capsule } from '../../clients/capsule.js';

export const getActions = (set: StoreApi<AppStore>['setState'], get: StoreApi<AppStore>['getState']): AppActions => ({
  resetState: () => {
    set(DEFAULT_APP_STATE);
  },
  setSelectedOrganization: orgId => {
    const userId = capsule.getUserId();

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
  getSelectedOrganization: () => {
    const userId = capsule.getUserId();
    return get().userSelectedOrganizationId[userId ?? ''];
  },
});
