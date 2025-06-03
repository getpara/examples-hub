import { useQuery } from '@tanstack/react-query';
import { OrganizationLoginMethodsTotalResponse } from '../../../types/api';
import { getOrganizationLoginMethodsTotal } from '../../../api/organizations/queries';
import { formatPercentTotalData } from '../../../utils/analyticsDataFormatters';
import { useParams } from 'react-router-dom';
import { useIsValidOrg } from '../../useIsValidOrgConfig';
import { LOGIN_METHOD_CONFIG } from '../../../utils/constants';

export const ORGANIZATIONS_LOGIN_METHODS_TOTAL_QUERY_KEY = 'organizationLoginMethodsTotal';

export const useOrganizationLoginMethodsTotalQuery = <T>(select: (data: OrganizationLoginMethodsTotalResponse) => T) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);

  return useQuery({
    enabled: isOrgValid,
    queryKey: [ORGANIZATIONS_LOGIN_METHODS_TOTAL_QUERY_KEY, organizationId],
    queryFn: async () => {
      const { data } = await getOrganizationLoginMethodsTotal(organizationId ?? '');

      const cleanedData: Record<string, (typeof data.data)[0]> = {};

      data.data.forEach(val => {
        const config = LOGIN_METHOD_CONFIG[val.method];

        if (config) {
          cleanedData[val.method] = val;
        } else {
          const otherVal = cleanedData.OTHER;

          if (!otherVal) {
            cleanedData.OTHER = { ...val, method: 'OTHER' };
          } else {
            cleanedData.OTHER = {
              ...otherVal,
              percent: otherVal.percent + val.percent,
              count: otherVal.count + val.count,
              userCount: otherVal.userCount + val.userCount,
            };
          }
        }
      });

      return { data: formatPercentTotalData(Object.values(cleanedData)) };
    },
    select,
  });
};

export const useOrganizationLoginMethodsTotal = () => {
  return useOrganizationLoginMethodsTotalQuery(data => {
    return data.data;
  });
};
