import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { resendVerificationCode } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const RESEND_VERIFICATION_CODE_KEY = 'RESEND_VERIFICATION_CODE';

/**
 * React hook for the `resendVerificationCode` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `resendVerificationCode`: function to trigger the mutation (same as `mutate`)
 *   - `resendVerificationCodeAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { resendVerificationCode, resendVerificationCodeAsync } = useResendVerificationCode();
 * resendVerificationCode({ ...params });
 * // or
 * await resendVerificationCodeAsync({ ...params });
 */
export const useResendVerificationCode = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [RESEND_VERIFICATION_CODE_KEY],
    mutationFn: async (args: CoreMethodParams<'resendVerificationCode'> = {}) => {
      try {
        const result = await resendVerificationCode(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'resendVerificationCode'>>>,
    Error,
    Compute<CoreMethodParams<'resendVerificationCode'>> | void,
    unknown,
    'resendVerificationCode'
  >(mutation, 'resendVerificationCode');
};
