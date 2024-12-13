import { StoreApi } from 'zustand';
import { DEFAULT_USER_INFO_STATE, UserInfoActions, UserInfoStore } from './useUserInfoStore.js';
import { extractAuthInfo } from '@usecapsule/user-management-client';

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
    return get().auth ? { ...extractAuthInfo(get().auth), pfpUrl: get().pfpUrl, displayName: get().displayName } : null;
  },
  setRecoveryShare: recoveryShare => {
    set({ recoveryShare });
  },
});
