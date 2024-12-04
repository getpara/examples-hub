import { formatPhoneNumber } from '@usecapsule/react-common';
import { CountryCallingCode } from 'libphonenumber-js';
import { useExtractedParams } from './useExtractedParams';
import { AuthParams, extractAuthInfo } from '@usecapsule/user-management-client';

export const useUsername = () => {
  const params = useExtractedParams<AuthParams>();

  const { auth, authType, identifier } = extractAuthInfo(params);

  switch (authType) {
    case 'phone':
      return formatPhoneNumber(identifier, auth.countryCode as CountryCallingCode);
    default:
      return identifier;
  }
};
