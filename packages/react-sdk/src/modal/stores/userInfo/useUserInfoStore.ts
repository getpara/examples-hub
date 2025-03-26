import { create } from 'zustand';
import { getActions } from './actions.js';
import { PrimaryAuth } from '@getpara/user-management-client';
import { ModalAuthInfo } from '@getpara/react-common';

type SetAuthInfo = PrimaryAuth & Partial<Pick<ModalAuthInfo, 'pfpUrl' | 'displayName'>>;

type UserInfoState = {
  auth: PrimaryAuth | null;
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
