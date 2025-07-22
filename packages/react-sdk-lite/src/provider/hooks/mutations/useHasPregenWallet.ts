import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { hasPregenWallet } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const HAS_PREGEN_WALLET_KEY = 'HAS_PREGEN_WALLET';

/**
 * React hook for the `hasPregenWallet` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `hasPregenWallet`: function to trigger the mutation (same as `mutate`)
 *   - `hasPregenWalletAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { hasPregenWallet, hasPregenWalletAsync } = useHasPregenWallet();
 * hasPregenWallet({ ...params });
 * // or
 * await hasPregenWalletAsync({ ...params });
 */
export const useHasPregenWallet = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [HAS_PREGEN_WALLET_KEY],
    mutationFn: async (args: CoreMethodParams<'hasPregenWallet'>) => {
      try {
        const result = await hasPregenWallet(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'hasPregenWallet'>>>,
    Error,
    Compute<CoreMethodParams<'hasPregenWallet'>>,
    unknown,
    'hasPregenWallet'
  >(mutation, 'hasPregenWallet');
};
