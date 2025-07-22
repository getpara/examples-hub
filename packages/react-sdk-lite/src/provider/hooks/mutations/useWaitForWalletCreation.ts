import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { waitForWalletCreation } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const WAIT_FOR_WALLET_CREATION_KEY = 'WAIT_FOR_WALLET_CREATION';

/**
 * React hook for the `waitForWalletCreation` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `waitForWalletCreation`: function to trigger the mutation (same as `mutate`)
 *   - `waitForWalletCreationAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { waitForWalletCreation, waitForWalletCreationAsync } = useWaitForWalletCreation();
 * waitForWalletCreation({ ...params });
 * // or
 * await waitForWalletCreationAsync({ ...params });
 */
export const useWaitForWalletCreation = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [WAIT_FOR_WALLET_CREATION_KEY],
    mutationFn: async (args: CoreMethodParams<'waitForWalletCreation'>) => {
      try {
        const result = await waitForWalletCreation(para, args);

        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'waitForWalletCreation'>>>,
    Error,
    Compute<CoreMethodParams<'waitForWalletCreation'>>,
    unknown,
    'waitForWalletCreation'
  >(mutation, 'waitForWalletCreation');
};
