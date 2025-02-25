import { useQuery } from '@tanstack/react-query';
import { OrganizationInvite } from '../../../types/api';
import { getOrganizationInvites } from '../../../api/users/queries';
import { useAccount } from '@getpara/react-sdk';

export const USER_INVITE_QUERY_KEY = 'userInvite';

export const useUserInviteQuery = <T>(
  select: (data: OrganizationInvite[]) => T,
  organizationId?: string,
  memberId?: string,
) => {
  const { data: account } = useAccount();
  const userId = account?.userId;

  return useQuery({
    enabled: !!userId && !!organizationId && !!memberId && account.isConnected,
    queryKey: [USER_INVITE_QUERY_KEY, userId, organizationId, memberId],
    queryFn: async () => {
      if (!userId || !organizationId || !memberId) {
        return [];
      }

      const { data } = await getOrganizationInvites(userId, organizationId, memberId);

      return data.organizations;
    },
    select,
  });
};

export const useGetInvite = (organizationId?: string, memberId?: string) => {
  return useUserInviteQuery(
    data => {
      return data[0];
    },
    organizationId,
    memberId,
  );
};
