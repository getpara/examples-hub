import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { verify2fa } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const VERIFY_2FA_KEY = 'VERIFY_2FA';

/**
 * React hook for the `verify2fa` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `verify2fa`: function to trigger the mutation (same as `mutate`)
 *   - `verify2faAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { verify2fa, verify2faAsync } = useVerify2fa();
 * verify2fa({ ...params });
 * // or
 * await verify2faAsync({ ...params });
 */
export const useVerify2fa = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [VERIFY_2FA_KEY],
    mutationFn: async (args: CoreMethodParams<'verify2fa'>) => {
      try {
        const result = await verify2fa(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'verify2fa'>>>,
    Error,
    Compute<CoreMethodParams<'verify2fa'>>,
    unknown,
    'verify2fa'
  >(mutation, 'verify2fa');
};
