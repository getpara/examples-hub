import { useQuery } from '@tanstack/react-query';
import { OrganizationMemberResponse } from '../../../types/api';
import { getOrganizationMember } from '../../../api/users/queries';
import { useParams } from 'react-router-dom';
import { useAccount } from '@getpara/react-sdk';
import { useIsValidOrg } from '../../useIsValidOrgConfig';

export const ORGANIZATION_MEMBER_QUERY_KEY = 'organizationMember';

export const useOrganizationMemberQuery = <T>(select: (data: OrganizationMemberResponse | undefined) => T) => {
  const { data: account } = useAccount();
  const userId = account?.userId;
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);

  return useQuery({
    enabled: !!userId && isOrgValid && account.isConnected,
    queryKey: [ORGANIZATION_MEMBER_QUERY_KEY, organizationId, userId],
    queryFn: async () => {
      if (!userId || !organizationId) {
        return undefined;
      }

      const { data } = await getOrganizationMember(userId, organizationId);

      return data;
    },
    select,
  });
};

export const useOrganizationMember = () => {
  return useOrganizationMemberQuery(data => {
    return data?.member;
  });
};

export const useIsOwner = () => {
  return useOrganizationMemberQuery(data => {
    return data?.member.owner;
  });
};

export const useOrganizationMemberCapabilities = () => {
  return useOrganizationMemberQuery(data => {
    return data?.capabilities;
  });
};
