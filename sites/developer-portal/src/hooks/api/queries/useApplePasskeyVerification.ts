import { useQuery } from '@tanstack/react-query';
import { checkApplePasskeyVerification } from '../../../api/apiKeys/queries';
import { useParams } from 'react-router-dom';
import { Environment } from '../../../types/environment';

export const APPLE_PASSKEY_VERIFICATION_QUERY_KEY = 'applePasskeyVerification';

/**
 * Hook to check if the Apple passkey configuration for the current API key is verified by Apple
 * @param options.enabled - Whether the query should be enabled
 */
export const useApplePasskeyVerification = ({ enabled }: { enabled?: boolean } = {}) => {
  const { organizationId, projectId, apiKey: keyId, env } = useParams();

  return useQuery({
    queryKey: [APPLE_PASSKEY_VERIFICATION_QUERY_KEY, organizationId, projectId, keyId, env],
    queryFn: () => checkApplePasskeyVerification(organizationId || '', projectId || '', keyId || '', env as Environment),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!organizationId && !!projectId && !!keyId && !!env && enabled,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
