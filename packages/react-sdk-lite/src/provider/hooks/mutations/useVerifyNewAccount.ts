import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { verifyNewAccount } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const VERIFY_NEW_ACCOUNT_KEY = 'VERIFY_NEW_ACCOUNT';

/**
 * React hook for the `verifyNewAccount` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `verifyNewAccount`: function to trigger the mutation (same as `mutate`)
 *   - `verifyNewAccountAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { verifyNewAccount, verifyNewAccountAsync } = useVerifyNewAccount();
 * verifyNewAccount({ ...params });
 * // or
 * await verifyNewAccountAsync({ ...params });
 */
export const useVerifyNewAccount = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [VERIFY_NEW_ACCOUNT_KEY],
    mutationFn: async (args: CoreMethodParams<'verifyNewAccount'>) => {
      try {
        const result = await verifyNewAccount(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'verifyNewAccount'>>>,
    Error,
    Compute<CoreMethodParams<'verifyNewAccount'>>,
    unknown,
    'verifyNewAccount'
  >(mutation, 'verifyNewAccount');
};
