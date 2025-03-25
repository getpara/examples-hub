import { ModalAuthInfo } from '@getpara/react-common';
import { useExtractedParams } from './useExtractedParams';
import { AuthParams, AuthInfo, extractAuthInfo } from '@getpara/user-management-client';

export const useAuthInfo = (): null | (AuthInfo & { displayName?: string; pfpUrl?: string }) => {
  const params = useExtractedParams<AuthParams & Pick<ModalAuthInfo, 'displayName' | 'pfpUrl'>>();
  const authInfo = extractAuthInfo(params, { allowUserId: true });

  return authInfo
    ? {
        ...authInfo,
        pfpUrl: params.pfpUrl,
        displayName: params.displayName,
      }
    : null;
};
