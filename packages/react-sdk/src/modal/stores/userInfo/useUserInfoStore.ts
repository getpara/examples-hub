import { create } from 'zustand';
import { getActions } from './actions.js';
import { CountryCallingCode } from 'libphonenumber-js';

interface UserInfoState {
  email: string;
  phone: string;
  countryCode: CountryCallingCode;
}

export interface UserInfoActions {
  resetState: () => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setCountryCode: (countryCode: CountryCallingCode) => void;
}

export type UserInfoStore = UserInfoState & UserInfoActions;

export const DEFAULT_USER_INFO_STATE: UserInfoState = { email: '', phone: '', countryCode: '+1' as CountryCallingCode };

export const useUserInfoStore = create<UserInfoStore>((set) => ({
  ...DEFAULT_USER_INFO_STATE,
  ...getActions(set),
}));
