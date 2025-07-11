import { useQuery } from '@tanstack/react-query';
import { useInternalClient } from '../utils/useInternalClient.js';

export const IS_FULLY_LOGGED_IN_BASE_KEY = 'PARA_FULLY_LOGGED_IN';

export type ParaStatus = {
  /**
   * Indicates whether the client's first-time setup is complete.
   */
  isReady: boolean;
  /**
   * Indicates whether the current application is a Farcaster Mini App.
   */
  isFarcasterMiniApp: boolean;
};

/**
 * Hook for retrieving the initial setup status of the Para client.
 *
 * @example
 * const status = useParaStatus();
 * if (status.isReady) {
 *   const isFarcasterMiniApp = status.isFarcasterMiniApp;
 *   // ...
 * }
 */
export const useParaStatus = (): ParaStatus => {
  const client = useInternalClient();

  const { data } = useQuery<ParaStatus>({
    enabled: !!client,
    queryKey: ['useParaStatus', client?.isReady ?? null, client?.isFarcasterMiniApp ?? null],
    queryFn: () => {
      return {
        isReady: client?.isReady ?? false,
        isFarcasterMiniApp: client?.isFarcasterMiniApp ?? false,
      };
    },
  });

  return data ?? { isReady: false, isFarcasterMiniApp: false };
};
