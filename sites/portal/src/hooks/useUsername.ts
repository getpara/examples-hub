import { formatPhoneNumber } from '@getpara/react-common';
import { CountryCallingCode } from 'libphonenumber-js';
import { useExtractedParams } from './useExtractedParams';
import { AuthParams, extractAuthInfo } from '@getpara/user-management-client';

export const useUsername = (): string | undefined => {
  const params = useExtractedParams<AuthParams>();

  const { auth, authType, identifier } = extractAuthInfo(params) || {};

  switch (authType) {
    case 'phone':
      return formatPhoneNumber(identifier, auth.countryCode as CountryCallingCode);
    default:
      return identifier ?? undefined;
  }
};
