import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { createPregenWalletPerType } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const CREATE_PREGEN_WALLET_PER_TYPE_KEY = 'CREATE_PREGEN_WALLET_PER_TYPE';

/**
 * React hook for the `createPregenWalletPerType` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `createPregenWalletPerType`: function to trigger the mutation (same as `mutate`)
 *   - `createPregenWalletPerTypeAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { createPregenWalletPerType, createPregenWalletPerTypeAsync } = useCreatePregenWalletPerType();
 * createPregenWalletPerType({ ...params });
 * // or
 * await createPregenWalletPerTypeAsync({ ...params });
 */
export const useCreatePregenWalletPerType = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [CREATE_PREGEN_WALLET_PER_TYPE_KEY],
    mutationFn: async (args: CoreMethodParams<'createPregenWalletPerType'>) => {
      try {
        const result = await createPregenWalletPerType(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'createPregenWalletPerType'>>>,
    Error,
    Compute<CoreMethodParams<'createPregenWalletPerType'>>,
    unknown,
    'createPregenWalletPerType'
  >(mutation, 'createPregenWalletPerType');
};
