import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { createWallet } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const CREATE_WALLET_KEY = 'CREATE_WALLET';

/**
 * React hook for the `createWallet` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `createWallet`: function to trigger the mutation (same as `mutate`)
 *   - `createWalletAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { createWallet, createWalletAsync } = useCreateWallet();
 * createWallet({ ...params });
 * // or
 * await createWalletAsync({ ...params });
 */
export const useCreateWallet = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [CREATE_WALLET_KEY],
    mutationFn: async (args: CoreMethodParams<'createWallet'> = {}) => {
      try {
        const result = await createWallet(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'createWallet'>>>,
    Error,
    Compute<CoreMethodParams<'createWallet'>> | void,
    unknown,
    'createWallet'
  >(mutation, 'createWallet');
};
