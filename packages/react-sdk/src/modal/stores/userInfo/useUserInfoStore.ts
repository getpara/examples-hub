import { create } from 'zustand';
import { getActions } from './actions.js';
import { Auth } from '@usecapsule/user-management-client';
import { ModalAuthInfo } from '@usecapsule/react-common';

type SetAuthInfo = Auth & Partial<Pick<ModalAuthInfo, 'pfpUrl' | 'displayName'>>;

type UserInfoState = {
  auth: Auth | null;
  pfpUrl: string | null;
  displayName: string | null;
  recoveryShare: string | null;
};

export interface UserInfoActions {
  resetState: () => void;
  setAuthInfo: (auth: SetAuthInfo) => void;
  getAuthInfo: () => ModalAuthInfo | null;
  setRecoveryShare: (recoveryShare: string | null) => void;
}

export type UserInfoStore = UserInfoState & UserInfoActions;

export const DEFAULT_USER_INFO_STATE: UserInfoState = {
  auth: null,
  recoveryShare: null,
  pfpUrl: null,
  displayName: null,
};

export const useUserInfoStore = create<UserInfoStore>((set, get) => ({
  ...DEFAULT_USER_INFO_STATE,
  ...getActions(set, get),
}));
