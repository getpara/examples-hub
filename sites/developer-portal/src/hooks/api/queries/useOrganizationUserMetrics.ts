import { useQuery } from '@tanstack/react-query';
import { OrganizationUserMetricsResponse } from '../../../types/api';
import { getOrganizationUserMetrics } from '../../../api/organizations/queries';
import { useParams } from 'react-router-dom';
import { useIsValidOrg } from '../../useIsValidOrgConfig';

export const ORGANIZATION_USER_METRICS_QUERY_KEY = 'organizationUserMetrics';

export const useOrganizationUserMetricsQuery = <T>(
  select: (data: OrganizationUserMetricsResponse) => T,
  startDate?: Date,
  endDate?: Date,
) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);

  return useQuery({
    enabled: isOrgValid,
    queryKey: [ORGANIZATION_USER_METRICS_QUERY_KEY, organizationId, startDate, endDate],
    queryFn: async () => {
      const { data } = await getOrganizationUserMetrics(organizationId ?? '', startDate, endDate);

      return data;
    },
    select,
  });
};

export const useOrganizationUserMetrics = (startDate?: Date, endDate?: Date) => {
  return useOrganizationUserMetricsQuery(
    data => {
      return data.userMetrics;
    },
    startDate,
    endDate,
  );
};
