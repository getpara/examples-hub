import { useQuery } from '@tanstack/react-query';
import { OrganizationTotalUserCountResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getOrganizationTotalUserCount } from '../../../api/organizations/queries';

export const ORGANIZATIONS_TOTAL_USER_COUNT_QUERY_KEY = 'organizationTotalUserCount';

export const useOrganizationTotalUserCountQuery = <T>(select: (data: OrganizationTotalUserCountResponse) => T) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [ORGANIZATIONS_TOTAL_USER_COUNT_QUERY_KEY, selectedOrganizationId],
    queryFn: async () => {
      const { data } = await getOrganizationTotalUserCount(selectedOrganizationId ?? '');

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
