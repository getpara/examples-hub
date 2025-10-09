import { useMutation } from '@tanstack/react-query';
import { useInternalClient } from '../utils/useInternalClient.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { Compute } from '../../types/utils.js';

export const SWITCH_WALLETS_KEY = 'SWITCH_WALLETS';

/**
 * React hook for the `switchWallets` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `switchWallets`: function to trigger the mutation (same as `mutate`)
 *   - `switchWalletsAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { switchWallets, switchWalletsAsync } = useSwitchWallets();
 * switchWallets({ authMethod: 'PASSKEY' });
 * // or
 * await switchWalletsAsync({ authMethod: 'PASSKEY' });
 */
export const useSwitchWallets = () => {
  const para = useInternalClient();

  const mutation = useMutation({
    mutationKey: [SWITCH_WALLETS_KEY],
    mutationFn: async (args: CoreMethodParams<'waitForLogin'> = {}) => {
      if (!para) {
        throw new Error('Para client not available');
      }
      try {
        const result = await para.waitForWalletSwitching(args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'waitForLogin'>>>,
    Error,
    Compute<CoreMethodParams<'waitForLogin'>> | void,
    unknown,
    'switchWallets'
  >(mutation, 'switchWallets');
};
