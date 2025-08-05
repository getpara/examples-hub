import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { createWalletPerType } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const CREATE_WALLET_PER_TYPE_KEY = 'CREATE_WALLET_PER_TYPE';

/**
 * React hook for the `createWalletPerType` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `createWalletPerType`: function to trigger the mutation (same as `mutate`)
 *   - `createWalletPerTypeAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { createWalletPerType, createWalletPerTypeAsync } = useCreateWalletPerType();
 * createWalletPerType({ ...params });
 * // or
 * await createWalletPerTypeAsync({ ...params });
 */
export const useCreateWalletPerType = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [CREATE_WALLET_PER_TYPE_KEY],
    mutationFn: async (args: CoreMethodParams<'createWalletPerType'> = {}) => {
      try {
        const result = await createWalletPerType(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'createWalletPerType'>>>,
    Error,
    Compute<CoreMethodParams<'createWalletPerType'>> | void,
    unknown,
    'createWalletPerType'
  >(mutation, 'createWalletPerType');
};
