import { useQuery } from '@tanstack/react-query';
import { OrganizationMember } from '../../../types/api';
import { getOrganizationMember } from '../../../api/users/queries';
import { useParams } from 'react-router-dom';
import { useAccount } from '@getpara/react-sdk';

export const ORGANIZATION_MEMBER_QUERY_KEY = 'organizationMember';

export const useOrganizationMemberQuery = <T>(select: (data: OrganizationMember | undefined) => T) => {
  const { data: account } = useAccount();
  const userId = account?.userId;
  const { organizationId } = useParams();

  return useQuery({
    enabled: !!userId && !!organizationId && account.isConnected,
    queryKey: [ORGANIZATION_MEMBER_QUERY_KEY, organizationId, userId],
    queryFn: async () => {
      if (!userId || !organizationId) {
        return undefined;
      }

      const { data } = await getOrganizationMember(userId, organizationId);

      return data.member;
    },
    select,
  });
};

export const useOrganizationMember = () => {
  return useOrganizationMemberQuery(data => {
    return data;
  });
};

export const useIsOwner = () => {
  return useOrganizationMemberQuery(data => {
    return data?.owner;
  });
};
