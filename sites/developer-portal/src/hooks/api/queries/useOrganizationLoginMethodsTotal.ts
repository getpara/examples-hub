import { useQuery } from '@tanstack/react-query';
import { OrganizationLoginMethodsTotalResponse } from '../../../types/api';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getOrganizationLoginMethodsTotal } from '../../../api/organizations/queries';
import { formatPercentTotalData } from '../../../utils/analyticsDataFormatters';

export const ORGANIZATIONS_LOGIN_METHODS_TOTAL_QUERY_KEY = 'organizationLoginMethodsTotal';

export const useOrganizationLoginMethodsTotalQuery = <T>(select: (data: OrganizationLoginMethodsTotalResponse) => T) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [ORGANIZATIONS_LOGIN_METHODS_TOTAL_QUERY_KEY, selectedOrganizationId],
    queryFn: async () => {
      const { data } = await getOrganizationLoginMethodsTotal(selectedOrganizationId ?? '');

      return { data: formatPercentTotalData(data.data) };
    },
    select,
  });
};

export const useOrganizationLoginMethodsTotal = () => {
  return useOrganizationLoginMethodsTotalQuery(data => {
    return data.data;
  });
};
