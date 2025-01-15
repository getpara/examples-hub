import { useQuery } from '@tanstack/react-query';
import { OrganizationLoginPlatformsTotalResponse } from '../../../types/api';
import { getOrganizationLoginPlatformsTotal } from '../../../api/organizations/queries';
import { formatPercentTotalData } from '../../../utils/analyticsDataFormatters';
import { useParams } from 'react-router-dom';

export const ORGANIZATIONS_LOGIN_PLATFORMS_TOTAL_QUERY_KEY = 'organizationLoginPlatformsTotal';

export const useOrganizationLoginPlatformsTotalQuery = <T>(select: (data: OrganizationLoginPlatformsTotalResponse) => T) => {
  const { organizationId } = useParams();

  return useQuery({
    enabled: !!organizationId,
    queryKey: [ORGANIZATIONS_LOGIN_PLATFORMS_TOTAL_QUERY_KEY, organizationId],
    queryFn: async () => {
      const { data } = await getOrganizationLoginPlatformsTotal(organizationId ?? '');

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
