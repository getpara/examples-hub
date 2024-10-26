import { StoreApi } from 'zustand';
import { DEFAULT_USER_INFO_STATE, UserInfoActions, UserInfoStore } from './useUserInfoStore.js';
import { CountryCallingCode } from 'libphonenumber-js';
import { formatPhoneNumber } from '@usecapsule/react-common';

export const getActions = (
  set: StoreApi<UserInfoStore>['setState'],
  get: StoreApi<UserInfoStore>['getState'],
): UserInfoActions => ({
  resetState: () => {
    set(DEFAULT_USER_INFO_STATE);
  },
  setIdentifier: identifier => {
    set({ identifier });
  },
  setIdentifierType: identifierType => {
    set({ identifierType });
  },
  setCountryCode: countryCode => {
    set({ countryCode });
  },
  getUsername: () => {
    const identifierType = get().identifierType;
    const identifier = get().identifier;

    let username = identifier;

    const isPhone = identifierType === 'phone';

    if (isPhone) {
      const countryCode = (get().countryCode?.split('+')[1] ?? '1') as CountryCallingCode;

      username = identifier.length > 2 ? formatPhoneNumber(identifier, countryCode) : '';
    }

    return username;
  },
  setRecoveryShare: recoveryShare => {
    set({ recoveryShare });
  },
});
