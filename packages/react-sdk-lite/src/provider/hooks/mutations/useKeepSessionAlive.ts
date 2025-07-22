import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { keepSessionAlive } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const KEEP_SESSION_ALIVE_KEY = 'KEEP_SESSION_ALIVE';

/**
 * React hook for the `keepSessionAlive` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `keepSessionAlive`: function to trigger the mutation (same as `mutate`)
 *   - `keepSessionAliveAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { keepSessionAlive, keepSessionAliveAsync } = useKeepSessionAlive();
 * keepSessionAlive({ ...params });
 * // or
 * await keepSessionAliveAsync({ ...params });
 */
export const useKeepSessionAlive = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [KEEP_SESSION_ALIVE_KEY],
    mutationFn: async (args: CoreMethodParams<'keepSessionAlive'>) => {
      try {
        const result = await keepSessionAlive(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'keepSessionAlive'>>>,
    Error,
    Compute<CoreMethodParams<'keepSessionAlive'>>,
    unknown,
    'keepSessionAlive'
  >(mutation, 'keepSessionAlive');
};
