import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getOrganizationEnterprisePrice } from '../../../api/organizations/queries';

export const ORGANIZATIONS_ENTERPRISE_PRICE_QUERY_KEY = 'organizationEnterprisePrice';

export const useOrganizationEnterprisePriceQuery = <T>(select: (data: number | undefined) => T) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [ORGANIZATIONS_ENTERPRISE_PRICE_QUERY_KEY, selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) {
        return undefined;
      }

      const { data } = await getOrganizationEnterprisePrice(selectedOrganizationId);

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
