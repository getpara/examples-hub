import { useQuery } from '@tanstack/react-query';
import { Organization } from '../../../types/api';
import { getOrganizations } from '../../../api/users/queries';
import { capsule } from '../../../clients/capsule';
import { usePlans } from '../../configs/usePlans';
import { useCallback } from 'react';
import { useAppStore } from '../../../stores/app/useAppStore';

export const ORGANIZATIONS_QUERY_KEY = 'organizations';

export const useOrganizationsQuery = <T>(select: (data: Organization[]) => T, retry?: boolean) => {
  const userId = capsule.getUserId();

  return useQuery({
    enabled: !!userId,
    queryKey: [ORGANIZATIONS_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const { data } = await getOrganizations(userId);

      return data.organizations;
    },
    select,
    retry,
  });
};

export const useGetAllOrganizations = (retry?: boolean) => {
  return useOrganizationsQuery(data => {
    return data;
  }, retry);
};

export const useGetSelectedOrganization = () => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useOrganizationsQuery(
    useCallback(
      data => {
        return data.find(o => o.id === selectedOrganizationId);
      },
      [selectedOrganizationId],
    ),
  );
};

export const useGetOrganizationPlan = () => {
  const { plans } = usePlans();

  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useOrganizationsQuery(
    useCallback(
      data => {
        const org = data.find(o => o.id === selectedOrganizationId);
        if (!org) return undefined;

        return plans.find(plan => plan.slug === org?.activePlanSlug);
      },
      [plans, selectedOrganizationId],
    ),
  );
};

export const useGetOrganizationPlanIndex = () => {
  const { plans } = usePlans();

  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useOrganizationsQuery(
    useCallback(
      data => {
        const org = data.find(o => o.id === selectedOrganizationId);
        if (!org) return undefined;

        return plans.findIndex(plan => plan.slug === org?.activePlanSlug);
      },
      [plans, selectedOrganizationId],
    ),
  );
};

export const useGetOrganizationEarlyAccess = () => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useOrganizationsQuery(
    useCallback(
      data => {
        const org = data.find(o => o.id === selectedOrganizationId);

        return {
          granted: org?.grantedEarlyAccessSlugs ?? [],
          requested: org?.requestedEarlyAccessSlugs ?? [],
        };
      },
      [selectedOrganizationId],
    ),
  );
};

export const useGetOrganizationAccess = () => {
  const selectedOrganizationId = useAppStore(state => state.getSelectedOrganization());

  return useOrganizationsQuery(
    useCallback(
      data => {
        const org = data.find(o => o.id === selectedOrganizationId);

        return {
          hasAccess: !!org?.hasDevPortalAccess,
          requestedAccess: !!org?.requestedDevPortalAccess,
        };
      },
      [selectedOrganizationId],
    ),
  );
};
