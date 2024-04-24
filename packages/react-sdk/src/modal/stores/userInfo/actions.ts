import { StoreApi } from 'zustand';
import { DEFAULT_USER_INFO_STATE, UserInfoActions, UserInfoStore } from './useUserInfoStore.js';

export const getActions = (set: StoreApi<UserInfoStore>['setState']): UserInfoActions => ({
  resetState: () => {
    set(DEFAULT_USER_INFO_STATE);
  },
  setEmail: (email) => {
    set({ email });
  },
});
