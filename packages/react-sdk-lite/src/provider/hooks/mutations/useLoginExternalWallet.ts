import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { loginExternalWallet } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const LOGIN_EXTERNAL_WALLET_KEY = 'LOGIN_EXTERNAL_WALLET';

/**
 * React hook for the `loginExternalWallet` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `loginExternalWallet`: function to trigger the mutation (same as `mutate`)
 *   - `loginExternalWalletAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { loginExternalWallet, loginExternalWalletAsync } = useLoginExternalWallet();
 * loginExternalWallet({ ...params });
 * // or
 * await loginExternalWalletAsync({ ...params });
 */
export const useLoginExternalWallet = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [LOGIN_EXTERNAL_WALLET_KEY],
    mutationFn: async (args: CoreMethodParams<'loginExternalWallet'>) => {
      try {
        const result = await loginExternalWallet(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'loginExternalWallet'>>>,
    Error,
    Compute<CoreMethodParams<'loginExternalWallet'>>,
    unknown,
    'loginExternalWallet'
  >(mutation, 'loginExternalWallet');
};
