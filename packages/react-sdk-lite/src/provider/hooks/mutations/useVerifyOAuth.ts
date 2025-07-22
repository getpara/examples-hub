import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { verifyOAuth } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const VERIFY_OAUTH_KEY = 'VERIFY_OAUTH';

/**
 * React hook for the `verifyOAuth` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `verifyOAuth`: function to trigger the mutation (same as `mutate`)
 *   - `verifyOAuthAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { verifyOAuth, verifyOAuthAsync } = useVerifyOAuth();
 * verifyOAuth({ ...params });
 * // or
 * await verifyOAuthAsync({ ...params });
 */
export const useVerifyOAuth = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [VERIFY_OAUTH_KEY],
    mutationFn: async (args: CoreMethodParams<'verifyOAuth'>) => {
      try {
        const result = await verifyOAuth(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'verifyOAuth'>>>,
    Error,
    Compute<CoreMethodParams<'verifyOAuth'>>,
    unknown,
    'verifyOAuth'
  >(mutation, 'verifyOAuth');
};
