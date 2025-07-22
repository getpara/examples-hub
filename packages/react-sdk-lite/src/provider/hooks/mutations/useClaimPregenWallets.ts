import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { claimPregenWallets } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const CLAIM_PREGEN_WALLETS_KEY = 'CLAIM_PREGEN_WALLETS';

/**
 * React hook for the `claimPregenWallets` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `claimPregenWallets`: function to trigger the mutation (same as `mutate`)
 *   - `claimPregenWalletsAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { claimPregenWallets, claimPregenWalletsAsync } = useClaimPregenWallets();
 * claimPregenWallets({ ...params });
 * // or
 * await claimPregenWalletsAsync({ ...params });
 */
export const useClaimPregenWallets = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [CLAIM_PREGEN_WALLETS_KEY],
    mutationFn: async (args: CoreMethodParams<'claimPregenWallets'>) => {
      try {
        const result = await claimPregenWallets(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'claimPregenWallets'>>>,
    Error,
    Compute<CoreMethodParams<'claimPregenWallets'>>,
    unknown,
    'claimPregenWallets'
  >(mutation, 'claimPregenWallets');
};
