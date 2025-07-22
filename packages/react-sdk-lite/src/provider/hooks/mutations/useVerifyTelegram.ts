import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { verifyTelegram } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const VERIFY_TELEGRAM_KEY = 'VERIFY_TELEGRAM';

/**
 * React hook for the `verifyTelegram` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `verifyTelegram`: function to trigger the mutation (same as `mutate`)
 *   - `verifyTelegramAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { verifyTelegram, verifyTelegramAsync } = useVerifyTelegram();
 * verifyTelegram({ ...params });
 * // or
 * await verifyTelegramAsync({ ...params });
 */
export const useVerifyTelegram = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [VERIFY_TELEGRAM_KEY],
    mutationFn: async (args: CoreMethodParams<'verifyTelegram'>) => {
      try {
        const result = await verifyTelegram(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'verifyTelegram'>>>,
    Error,
    Compute<CoreMethodParams<'verifyTelegram'>>,
    unknown,
    'verifyTelegram'
  >(mutation, 'verifyTelegram');
};
