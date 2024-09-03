import { create } from 'zustand';
import { getActions } from './actions.js';
import { CountryCallingCode } from 'libphonenumber-js';

type IdentifierType = 'email' | 'phone';

interface UserInfoState {
  identifier: string;
  identifierType?: IdentifierType;
  countryCode: CountryCallingCode;
  recoveryShare: string | null;
}

export interface UserInfoActions {
  resetState: () => void;
  setIdentifier: (identifier: string) => void;
  setIdentifierType: (identifierType?: IdentifierType) => void;
  setCountryCode: (countryCode: CountryCallingCode) => void;
  getUsername: () => string;
  setRecoveryShare: (recoveryShare: string | null) => void;
}

export type UserInfoStore = UserInfoState & UserInfoActions;

export const DEFAULT_USER_INFO_STATE: UserInfoState = {
  identifier: '',
  identifierType: undefined,
  countryCode: '+1' as CountryCallingCode,
  recoveryShare: null,
};

export const useUserInfoStore = create<UserInfoStore>((set, get) => ({
  ...DEFAULT_USER_INFO_STATE,
  ...getActions(set, get),
}));
