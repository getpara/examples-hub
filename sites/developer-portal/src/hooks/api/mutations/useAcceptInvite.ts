import { MutationOptions, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../clients/queryClient';
import { ORGANIZATIONS_QUERY_KEY } from '../queries/useOrganizations';
import { AcceptInviteVars, acceptOrganizationInvite } from '../../../api/users/mutations';
import { useAccount } from '@getpara/react-sdk';

export const useAcceptInvite = (options?: MutationOptions<boolean, Error, Omit<AcceptInviteVars, 'userId'>, unknown>) => {
  const { data: account } = useAccount();
  const userId = account?.userId;

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
