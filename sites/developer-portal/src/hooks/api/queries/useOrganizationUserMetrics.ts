import { useQuery } from '@tanstack/react-query';
import { OrganizationUserMetricsResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getOrganizationUserMetrics } from '../../../api/organizations/queries';

export const ORGANIZATION_USER_METRICS_QUERY_KEY = 'organizationUserMetrics';

export const useOrganizationUserMetricsQuery = <T>(
  select: (data: OrganizationUserMetricsResponse) => T,
  startDate?: Date,
  endDate?: Date,
) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId && !!startDate && !!endDate,
    queryKey: [ORGANIZATION_USER_METRICS_QUERY_KEY, selectedOrganizationId, startDate, endDate],
    queryFn: async () => {
      const { data } = await getOrganizationUserMetrics(selectedOrganizationId ?? '', startDate, endDate);

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
