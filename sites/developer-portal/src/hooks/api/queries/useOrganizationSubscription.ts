import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../../stores/app/useAppStore';
import { getOrganizationSubscription } from '../../../api/organizations/queries';
import { Subscription } from '../../../types/api';

export const ORGANIZATIONS_SUBSCRIPTION_QUERY_KEY = 'organizationSubscription';

export const useOrganizationSubscriptionQuery = <T>(select: (data: Subscription | undefined) => T) => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useQuery({
    enabled: !!selectedOrganizationId,
    queryKey: [ORGANIZATIONS_SUBSCRIPTION_QUERY_KEY, selectedOrganizationId],
    queryFn: async () => {
      if (!selectedOrganizationId) {
        return undefined;
      }

      const { data } = await getOrganizationSubscription(selectedOrganizationId);

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
