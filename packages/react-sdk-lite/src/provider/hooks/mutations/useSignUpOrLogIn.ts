import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { signUpOrLogIn } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const SIGN_UP_LOG_IN_KEY = 'SIGN_UP_LOG_IN';

/**
 * React hook for the `signUpOrLogIn` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `signUpOrLogIn`: function to trigger the mutation (same as `mutate`)
 *   - `signUpOrLogInAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { signUpOrLogIn, signUpOrLogInAsync } = useSignUpOrLogIn();
 * signUpOrLogIn({ ...params });
 * // or
 * await signUpOrLogInAsync({ ...params });
 */
export const useSignUpOrLogIn = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [SIGN_UP_LOG_IN_KEY],
    mutationFn: async (args: CoreMethodParams<'signUpOrLogIn'>) => {
      try {
        const result = await signUpOrLogIn(para, args);

        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'signUpOrLogIn'>>>,
    Error,
    Compute<CoreMethodParams<'signUpOrLogIn'>>,
    unknown,
    'signUpOrLogIn'
  >(mutation, 'signUpOrLogIn');
};
