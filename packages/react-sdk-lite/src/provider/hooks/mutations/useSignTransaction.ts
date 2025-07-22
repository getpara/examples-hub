import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { signTransaction } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const SIGN_TRANSACTION_KEY = 'SIGN_TRANSACTION';

/**
 * React hook for the `signTransaction` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `signTransaction`: function to trigger the mutation (same as `mutate`)
 *   - `signTransactionAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { signTransaction, signTransactionAsync } = useSignTransaction();
 * signTransaction({ ...params });
 * // or
 * await signTransactionAsync({ ...params });
 */
export const useSignTransaction = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [SIGN_TRANSACTION_KEY],
    mutationFn: async (args: CoreMethodParams<'signTransaction'>) => {
      try {
        const result = await signTransaction(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'signTransaction'>>>,
    Error,
    Compute<CoreMethodParams<'signTransaction'>>,
    unknown,
    'signTransaction'
  >(mutation, 'signTransaction');
};
