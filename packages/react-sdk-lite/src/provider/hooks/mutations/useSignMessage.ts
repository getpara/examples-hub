import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { signMessage } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const SIGN_MESSAGE_KEY = 'SIGN_MESSAGE';

/**
 * React hook for the `signMessage` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `signMessage`: function to trigger the mutation (same as `mutate`)
 *   - `signMessageAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { signMessage, signMessageAsync } = useSignMessage();
 * signMessage({ ...params });
 * // or
 * await signMessageAsync({ ...params });
 */
export const useSignMessage = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [SIGN_MESSAGE_KEY],
    mutationFn: async (args: CoreMethodParams<'signMessage'>) => {
      try {
        const result = await signMessage(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'signMessage'>>>,
    Error,
    Compute<CoreMethodParams<'signMessage'>>,
    unknown,
    'signMessage'
  >(mutation, 'signMessage');
};
