import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { createPregenWallet } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const CREATE_PREGEN_WALLET_KEY = 'CREATE_PREGEN_WALLET';

/**
 * React hook for the `createPregenWallet` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `createPregenWallet`: function to trigger the mutation (same as `mutate`)
 *   - `createPregenWalletAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { createPregenWallet, createPregenWalletAsync } = useCreatePregenWallet();
 * createPregenWallet({ ...params });
 * // or
 * await createPregenWalletAsync({ ...params });
 */
export const useCreatePregenWallet = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [CREATE_PREGEN_WALLET_KEY],
    mutationFn: async (args: CoreMethodParams<'createPregenWallet'>) => {
      try {
        const result = await createPregenWallet(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'createPregenWallet'>>>,
    Error,
    Compute<CoreMethodParams<'createPregenWallet'>>,
    unknown,
    'createPregenWallet'
  >(mutation, 'createPregenWallet');
};
