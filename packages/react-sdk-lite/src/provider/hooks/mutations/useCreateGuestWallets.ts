import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { createGuestWallets } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const CREATE_GUEST_WALLETS_KEY = 'CREATE_GUEST_WALLETS';

/**
 * React hook for the `createGuestWallets` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `createGuestWallets`: function to trigger the mutation (same as `mutate`)
 *   - `createGuestWalletsAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { createGuestWallets, createGuestWalletsAsync } = useCCreateGuestWallets();
 * createGuestWallets({ ...params });
 * // or
 * await createGuestWalletsAsync({ ...params });
 */
export const useCreateGuestWallets = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [CREATE_GUEST_WALLETS_KEY],
    mutationFn: async (args: CoreMethodParams<'createGuestWallets'>) => {
      try {
        const result = await createGuestWallets(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'createGuestWallets'>>>,
    Error,
    Compute<CoreMethodParams<'createGuestWallets'>>,
    unknown,
    'createGuestWallets'
  >(mutation, 'createGuestWallets');
};
