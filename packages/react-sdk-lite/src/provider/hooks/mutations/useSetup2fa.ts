import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { setup2fa } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const SETUP_2FA_KEY = 'SETUP_2FA';

/**
 * React hook for the `setup2fa` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `setup2fa`: function to trigger the mutation (same as `mutate`)
 *   - `setup2faAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { setup2fa, setup2faAsync } = useSetup2fa();
 * setup2fa({ ...params });
 * // or
 * await setup2faAsync({ ...params });
 */
export const useSetup2fa = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [SETUP_2FA_KEY],
    mutationFn: async (args: CoreMethodParams<'setup2fa'>) => {
      try {
        const result = await setup2fa(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'setup2fa'>>>,
    Error,
    Compute<CoreMethodParams<'setup2fa'>>,
    unknown,
    'setup2fa'
  >(mutation, 'setup2fa');
};
