import { useQuery } from '@tanstack/react-query';
import { Organization } from '../../../types/api';
import { getOrganizationInvites } from '../../../api/users/queries';
import { capsule } from '../../../clients/capsule';

export const USER_INVITES_QUERY_KEY = 'userInvites';

export const useUserInvitesQuery = <T>(select: (data: Organization[]) => T) => {
  const userId = capsule.getUserId();

  return useQuery({
    enabled: !!userId,
    queryKey: [USER_INVITES_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const { data } = await getOrganizationInvites(userId);

      return data.organizations;
    },
    select,
  });
};

export const useGetAllInvites = () => {
  return useUserInvitesQuery(data => {
    return data;
  });
};
