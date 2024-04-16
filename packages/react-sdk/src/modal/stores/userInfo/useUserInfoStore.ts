import { create } from 'zustand';
import { getActions } from './actions.js';

interface UserInfoState {
  email: string;
}

export interface UserInfoActions {
  resetState: () => void;
  setEmail: (email: string) => void;
}

export type UserInfoStore = UserInfoState & UserInfoActions;

export const DEFAULT_USER_INFO_STATE: UserInfoState = { email: '' };

export const useUserInfoStore = create<UserInfoStore>((set) => ({
  ...DEFAULT_USER_INFO_STATE,
  ...getActions(set),
}));
