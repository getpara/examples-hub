import { useQuery } from '@tanstack/react-query';
import { getOrganizationSubscription } from '../../../api/organizations/queries';
import { Subscription } from '../../../types/api';
import { useParams } from 'react-router-dom';
import { useIsValidOrg } from '../../useIsValidOrgConfig';

export const ORGANIZATIONS_SUBSCRIPTION_QUERY_KEY = 'organizationSubscription';

export const useOrganizationSubscriptionQuery = <T>(select: (data: Subscription | undefined) => T) => {
  const { organizationId } = useParams();
  const isOrgValid = useIsValidOrg(organizationId);

  return useQuery({
    enabled: isOrgValid,
    queryKey: [ORGANIZATIONS_SUBSCRIPTION_QUERY_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return undefined;
      }

      const { data } = await getOrganizationSubscription(organizationId);

      return data.subscription;
    },
    select,
  });
};

export const useGetOrganizationSubscription = () => {
  return useOrganizationSubscriptionQuery(data => {
    return data;
  });
};

export const useHasStripeSubscription = () => {
  return useOrganizationSubscriptionQuery(data => {
    // If billing is defined the org has a subscription through Stripe
    return !!data?.billing;
  });
};

export const useWillStripeSubscriptionCancel = () => {
  return useOrganizationSubscriptionQuery(data => {
    return !!data?.cancelAtPeriodEnd;
  });
};

export const useGetOrganizationSubscriptionPlan = () => {
  return useOrganizationSubscriptionQuery(data => {
    return data?.plan;
  });
};

export const useGetOrganizationHasNativePasskeyAccess = () => {
  return useOrganizationSubscriptionQuery(data => {
    return data?.plan?.canUseNativePasskeys;
  });
};
