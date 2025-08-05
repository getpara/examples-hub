import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { verifyFarcaster } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const VERIFY_FARCASTER_KEY = 'VERIFY_FARCASTER';

/**
 * React hook for the `verifyFarcaster` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `verifyFarcaster`: function to trigger the mutation (same as `mutate`)
 *   - `verifyFarcasterAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { verifyFarcaster, verifyFarcasterAsync } = useVerifyFarcaster();
 * verifyFarcaster({ ...params });
 * // or
 * await verifyFarcasterAsync({ ...params });
 */
export const useVerifyFarcaster = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [VERIFY_FARCASTER_KEY],
    mutationFn: async (args: CoreMethodParams<'verifyFarcaster'> = {}) => {
      try {
        const result = await verifyFarcaster(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'verifyFarcaster'>>>,
    Error,
    Compute<CoreMethodParams<'verifyFarcaster'>> | void,
    unknown,
    'verifyFarcaster'
  >(mutation, 'verifyFarcaster');
};
