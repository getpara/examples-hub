import { create } from 'zustand';

interface UserState {
  currentWalletId?: string;
}

export interface UserActions {
  updateState: (state: Partial<UserState>) => void;
}

export type UserStore = UserState & UserActions;

export const DEFAULT_USER_STATE: UserState = {
  currentWalletId: undefined,
};

export const useUserStore = create<UserStore>(set => ({
  ...DEFAULT_USER_STATE,
  updateState: state => {
    set(state);
  },
}));
