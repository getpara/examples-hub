import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { waitForSignup } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const WAIT_FOR_SIGN_UP_KEY = 'WAIT_FOR_SIGN_UP';

/**
 * React hook for the `waitForSignup` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `waitForSignup`: function to trigger the mutation (same as `mutate`)
 *   - `waitForSignupAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { waitForSignup, waitForSignupAsync } = useWaitForSignup();
 * waitForSignup({ ...params });
 * // or
 * await waitForSignupAsync({ ...params });
 */
export const useWaitForSignup = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [WAIT_FOR_SIGN_UP_KEY],
    mutationFn: async (args: CoreMethodParams<'waitForSignup'>) => {
      try {
        const result = await waitForSignup(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'waitForSignup'>>>,
    Error,
    Compute<CoreMethodParams<'waitForSignup'>>,
    unknown,
    'waitForSignup'
  >(mutation, 'waitForSignup');
};
