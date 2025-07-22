import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { logout } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const LOGOUT_KEY = 'LOGOUT';

/**
 * React hook for the `logout` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `logout`: function to trigger the mutation (same as `mutate`)
 *   - `logoutAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { logout, logoutAsync } = useLogout();
 * logout({ ...params });
 * // or
 * await logoutAsync({ ...params });
 */
export const useLogout = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [LOGOUT_KEY],
    mutationFn: async (args: CoreMethodParams<'logout'> = {}) => {
      try {
        const result = await logout(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'logout'>>>,
    Error,
    Compute<CoreMethodParams<'logout'>> | void,
    unknown,
    'logout'
  >(mutation, 'logout');
};
