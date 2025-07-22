import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { updatePregenWalletIdentifier } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const UPDATE_PREGEN_WALLET_IDENTIFIER_KEY = 'UPDATE_PREGEN_WALLET_IDENTIFIER';

/**
 * React hook for the `updatePregenWalletIdentifier` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `updatePregenWalletIdentifier`: function to trigger the mutation (same as `mutate`)
 *   - `updatePregenWalletIdentifierAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { updatePregenWalletIdentifier, updatePregenWalletIdentifierAsync } = useUpdatePregenWalletIdentifier();
 * updatePregenWalletIdentifier({ ...params });
 * // or
 * await updatePregenWalletIdentifierAsync({ ...params });
 */
export const useUpdatePregenWalletIdentifier = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [UPDATE_PREGEN_WALLET_IDENTIFIER_KEY],
    mutationFn: async (args: CoreMethodParams<'updatePregenWalletIdentifier'>) => {
      try {
        const result = await updatePregenWalletIdentifier(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'updatePregenWalletIdentifier'>>>,
    Error,
    Compute<CoreMethodParams<'updatePregenWalletIdentifier'>>,
    unknown,
    'updatePregenWalletIdentifier'
  >(mutation, 'updatePregenWalletIdentifier');
};
