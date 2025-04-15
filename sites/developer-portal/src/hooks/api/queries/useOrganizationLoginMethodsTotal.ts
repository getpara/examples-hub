import { useQuery } from '@tanstack/react-query';
import { OrganizationLoginMethodsTotalResponse } from '../../../types/api';
import { getOrganizationLoginMethodsTotal } from '../../../api/organizations/queries';
import { formatPercentTotalData } from '../../../utils/analyticsDataFormatters';
import { useParams } from 'react-router-dom';
import { useIsValidOrg } from '../../useIsValidOrgConfig';

export const ORGANIZATIONS_LOGIN_METHODS_TOTAL_QUERY_KEY = 'organizationLoginMethodsTotal';

export const useOrganizationLoginMethodsTotalQuery = <T>(select: (data: OrganizationLoginMethodsTotalResponse) => T) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);

  return useQuery({
    enabled: isOrgValid,
    queryKey: [ORGANIZATIONS_LOGIN_METHODS_TOTAL_QUERY_KEY, organizationId],
    queryFn: async () => {
      const { data } = await getOrganizationLoginMethodsTotal(organizationId ?? '');

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
