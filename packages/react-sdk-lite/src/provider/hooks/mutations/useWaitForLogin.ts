import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { waitForLogin } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const WAIT_FOR_LOG_IN_KEY = 'WAIT_FOR_LOG_IN';

/**
 * React hook for the `waitForLogin` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `waitForLogin`: function to trigger the mutation (same as `mutate`)
 *   - `waitForLoginAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { waitForLogin, waitForLoginAsync } = useWaitForLogin();
 * waitForLogin({ ...params });
 * // or
 * await waitForLoginAsync({ ...params });
 */
export const useWaitForLogin = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [WAIT_FOR_LOG_IN_KEY],
    mutationFn: async (args: CoreMethodParams<'waitForLogin'>) => {
      try {
        const result = await waitForLogin(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'waitForLogin'>>>,
    Error,
    Compute<CoreMethodParams<'waitForLogin'>>,
    unknown,
    'waitForLogin'
  >(mutation, 'waitForLogin');
};
