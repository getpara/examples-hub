import { useQuery } from '@tanstack/react-query';
import { getOrganizationEnterprisePrice } from '../../../api/organizations/queries';
import { useParams } from 'react-router-dom';

export const ORGANIZATIONS_ENTERPRISE_PRICE_QUERY_KEY = 'organizationEnterprisePrice';

export const useOrganizationEnterprisePriceQuery = <T>(select: (data: number | undefined) => T) => {
  const { organizationId } = useParams();

  return useQuery({
    enabled: !!organizationId,
    queryKey: [ORGANIZATIONS_ENTERPRISE_PRICE_QUERY_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return undefined;
      }

      const { data } = await getOrganizationEnterprisePrice(organizationId);

      return data.price / 100;
    },
    select,
  });
};

export const useGetOrganizationEnterprisePrice = () => {
  return useOrganizationEnterprisePriceQuery(data => {
    return data;
  });
};
