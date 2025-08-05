import { useMutation } from '@tanstack/react-query';
import { useClient } from '../utils/index.js';
import { CoreMethodParams, CoreMethodResponse } from '@getpara/web-sdk';
import { renameMutations } from '../../utils/renameMutations.js';
import { issueJwt } from '../../actions/index.js';
import { Compute } from '../../types/utils.js';

export const ISSUE_JWT_KEY = 'ISSUE_JWT';

/**
 * React hook for the `issueJwt` mutation.
 *
 * Returns a mutation result object with all standard fields from `useMutation`, except:
 * - `mutate` and `mutateAsync` are replaced by:
 *   - `issueJwt`: function to trigger the mutation (same as `mutate`)
 *   - `issueJwtAsync`: async function to trigger the mutation (same as `mutateAsync`)
 *
 * @example
 * const { issueJwt, issueJwtAsync } = useIssueJwt();
 * issueJwt({ ...params });
 * // or
 * await issueJwtAsync({ ...params });
 */
export const useIssueJwt = () => {
  const para = useClient();

  const mutation = useMutation({
    mutationKey: [ISSUE_JWT_KEY],
    mutationFn: async (args: CoreMethodParams<'issueJwt'> = {}) => {
      try {
        const result = await issueJwt(para, args);
        return result;
      } catch (error) {
        throw error;
      }
    },
  });

  return renameMutations<
    Compute<Awaited<CoreMethodResponse<'issueJwt'>>>,
    Error,
    Compute<CoreMethodParams<'issueJwt'>> | void,
    unknown,
    'issueJwt'
  >(mutation, 'issueJwt');
};
