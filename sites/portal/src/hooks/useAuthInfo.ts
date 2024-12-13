import { ModalAuthInfo } from '@usecapsule/react-common';
import { useExtractedParams } from './useExtractedParams';
import { AuthParams, extractAuthInfo } from '@usecapsule/user-management-client';

export const useAuthInfo = () => {
  const params = useExtractedParams<AuthParams & Pick<ModalAuthInfo, 'displayName' | 'pfpUrl'>>();

  return { ...extractAuthInfo(params), pfpUrl: params.pfpUrl, displayName: params.displayName };
};
