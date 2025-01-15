import { useQuery } from '@tanstack/react-query';
import { OrganizationTotalUserCountResponse } from '../../../types/api';
import { getOrganizationTotalUserCount } from '../../../api/organizations/queries';
import { useParams } from 'react-router-dom';

export const ORGANIZATIONS_TOTAL_USER_COUNT_QUERY_KEY = 'organizationTotalUserCount';

export const useOrganizationTotalUserCountQuery = <T>(select: (data: OrganizationTotalUserCountResponse) => T) => {
  const { organizationId } = useParams();

  return useQuery({
    enabled: !!organizationId,
    queryKey: [ORGANIZATIONS_TOTAL_USER_COUNT_QUERY_KEY, organizationId],
    queryFn: async () => {
      const { data } = await getOrganizationTotalUserCount(organizationId ?? '');

      return data;
    },
    select,
  });
};

export const useOrganizationTotalUserCount = () => {
  return useOrganizationTotalUserCountQuery(data => {
    return data;
  });
};
