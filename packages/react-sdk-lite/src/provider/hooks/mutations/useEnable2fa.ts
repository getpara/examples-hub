import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { enable2fa } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const ENABLE_2FA_KEY = 'ENABLE_2FA';

/**
 * React hook for the `enable2fa` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `enable2fa`: function to trigger the mutation (same as `mutate`)
 *   - `enable2faAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { enable2fa, enable2faAsync } = useEnable2fa();
 * enable2fa({ ...params });
 * // or
 * await enable2faAsync({ ...params });
 */
export const useEnable2fa = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [ENABLE_2FA_KEY],
    mutationFn: async (args: CoreMethodParams<'enable2fa'>) => {
      try {
        const result = await enable2fa(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'enable2fa'>>>,
    Error,
    Compute<CoreMethodParams<'enable2fa'>>,
    unknown,
    'enable2fa'
  >(mutation, 'enable2fa');
};
