import { useQuery } from '@tanstack/react-query';
import { OrganizationLoginPlatformsTotalResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getOrganizationLoginPlatformsTotal } from '../../../api/organizations/queries';
import { formatPercentTotalData } from '../../../utils/analyticsDataFormatters';

export const ORGANIZATIONS_LOGIN_PLATFORMS_TOTAL_QUERY_KEY = 'organizationLoginPlatformsTotal';

export const useOrganizationLoginPlatformsTotalQuery = <T>(select: (data: OrganizationLoginPlatformsTotalResponse) => T) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [ORGANIZATIONS_LOGIN_PLATFORMS_TOTAL_QUERY_KEY, selectedOrganizationId],
    queryFn: async () => {
      const { data } = await getOrganizationLoginPlatformsTotal(selectedOrganizationId ?? '');

      return { data: formatPercentTotalData(data.data) };
    },
    select,
  });
};

export const useOrganizationLoginPlatformsTotal = () => {
  return useOrganizationLoginPlatformsTotalQuery(data => {
    return data.data;
  });
};
