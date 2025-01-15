import { useQuery } from '@tanstack/react-query';
import { Organization } from '../../../types/api';
import { getOrganizations } from '../../../api/users/queries';
import { capsule } from '../../../clients/capsule';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

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

export const useGetAllOrganizationsWithAccess = (retry?: boolean) => {
  return useOrganizationsQuery(data => {
    return data.filter(d => d.hasDevPortalAccess);
  }, retry);
};

export const useGetSelectedOrganization = () => {
  const { organizationId } = useParams();

  return useOrganizationsQuery(
    useCallback(
      data => {
        return data.find(o => o.id === organizationId);
      },
      [organizationId],
    ),
  );
};

export const useGetSelectedOrganizationIsValid = () => {
  const { organizationId } = useParams();

  return useOrganizationsQuery(
    useCallback(
      data => {
        const org = data.find(o => o.id === organizationId);
        return !org?.suspended && !org?.archived;
      },
      [organizationId],
    ),
  );
};

export const useGetOrganizationEarlyAccess = () => {
  const { organizationId } = useParams();

  return useOrganizationsQuery(
    useCallback(
      data => {
        const org = data.find(o => o.id === organizationId);

        return {
          granted: org?.grantedEarlyAccessSlugs ?? [],
          requested: org?.requestedEarlyAccessSlugs ?? [],
        };
      },
      [organizationId],
    ),
  );
};

export const useGetOrganizationAccess = () => {
  const { organizationId } = useParams();

  return useOrganizationsQuery(
    useCallback(
      data => {
        const org = data.find(o => o.id === organizationId);

        return {
          hasAccess: !!org?.hasDevPortalAccess,
          requestedAccess: !!org?.requestedDevPortalAccess,
        };
      },
      [organizationId],
    ),
  );
};
