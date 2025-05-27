import { useQuery } from '@tanstack/react-query';
import { OrganizationPremiumFeaturesResponse } from '../../../types/api';
import { getOrganizationPremiumFeatures } from '../../../api/organizations/queries';
import { useParams } from 'react-router-dom';

export const PREMIUM_FEATURES_QUERY_KEY = 'premiumFeatures';

export const usePremiumFeaturesQuery = <T>(select: (data: OrganizationPremiumFeaturesResponse) => T) => {
  const { organizationId } = useParams();

  return useQuery({
    queryKey: [PREMIUM_FEATURES_QUERY_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return {} as OrganizationPremiumFeaturesResponse;
      }

      const { data } = await getOrganizationPremiumFeatures(organizationId);

      return data;
    },
    select,
  });
};

export const usePremiumFeatures = () => {
  return usePremiumFeaturesQuery(data => {
    return data;
  });
};
