import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { verifyExternalWallet } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const VERIFY_EXTERNAL_WALLET_KEY = 'VERIFY_EXTERNAL_WALLET';

/**
 * React hook for the `verifyExternalWallet` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `verifyExternalWallet`: function to trigger the mutation (same as `mutate`)
 *   - `verifyExternalWalletAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { verifyExternalWallet, verifyExternalWalletAsync } = useVerifyExternalWallet();
 * verifyExternalWallet({ ...params });
 * // or
 * await verifyExternalWalletAsync({ ...params });
 */
export const useVerifyExternalWallet = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [VERIFY_EXTERNAL_WALLET_KEY],
    mutationFn: async (args: CoreMethodParams<'verifyExternalWallet'>) => {
      try {
        const result = await verifyExternalWallet(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'verifyExternalWallet'>>>,
    Error,
    Compute<CoreMethodParams<'verifyExternalWallet'>>,
    unknown,
    'verifyExternalWallet'
  >(mutation, 'verifyExternalWallet');
};
