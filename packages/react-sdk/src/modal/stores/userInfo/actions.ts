import { StoreApi } from 'zustand';
import { DEFAULT_USER_INFO_STATE, UserInfoActions, UserInfoStore } from './useUserInfoStore.js';
import { extractAuthInfo } from '@getpara/user-management-client';

export const getActions = (
  set: StoreApi<UserInfoStore>['setState'],
  get: StoreApi<UserInfoStore>['getState'],
): UserInfoActions => ({
  resetState: () => {
    set(DEFAULT_USER_INFO_STATE);
  },
  setAuthInfo: ({ pfpUrl, displayName, ...auth }) => {
    set({ auth, pfpUrl: pfpUrl || null, displayName: displayName || null });
  },
  getAuthInfo: () => {
    try {
      return get().auth
        ? { ...extractAuthInfo(get().auth!, { isRequired: true }), pfpUrl: get().pfpUrl, displayName: get().displayName }
        : null;
    } catch (e) {
      return null;
    }
  },
  setRecoveryShare: recoveryShare => {
    set({ recoveryShare });
  },
});
