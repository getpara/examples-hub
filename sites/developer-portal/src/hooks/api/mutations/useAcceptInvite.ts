import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { AcceptInviteVars, acceptOrganizationInvite } from '../../../api/users/mutations';
import { capsule } from '../../../clients/capsule';

export const useAcceptInvite = (options?: MutationOptions<boolean, Error, Omit<AcceptInviteVars, 'userId'>, unknown>) => {
  const userId = capsule.getUserId();

  return useMutation<boolean, Error, Omit<AcceptInviteVars, 'userId'>, unknown>({
    mutationFn: vars =>
      acceptOrganizationInvite({
        ...vars,
        userId: userId ?? '',
      }),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATIONS_QUERY_KEY],
      });
    },
    ...options,
  });
};
