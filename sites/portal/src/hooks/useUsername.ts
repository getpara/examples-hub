import { displayPhoneNumber } from '@getpara/web-sdk';
import { useExtractedParams } from './useExtractedParams';
import { AuthParams, extractAuthInfo } from '@getpara/user-management-client';

export const useUsername = (): string | undefined => {
  const params = useExtractedParams<AuthParams>();

  const { authType, identifier } = extractAuthInfo(params) || {};

  switch (authType) {
    case 'phone':
      return displayPhoneNumber(identifier);
    default:
      return identifier ?? undefined;
  }
};
