import { useQuery } from '@tanstack/react-query';
import { Organization } from '../../../types/api';
import { getOrganizations } from '../../../api/users/queries';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from '@getpara/react-sdk';

export const ORGANIZATIONS_QUERY_KEY = 'organizations';

export const useOrganizationsQuery = <T>(select: (data: Organization[]) => T, retry?: boolean) => {
  const {
    isConnected,
    embedded: { userId },
  } = useAccount();

  return useQuery({
    enabled: !!userId && isConnected,
    queryKey: [ORGANIZATIONS_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const { data } = await getOrganizations(userId);

      // Sort: non-archived first (by createdAt asc), archived last (by createdAt asc)
      data.organizations.sort((a, b) => {
        if (a.archived === b.archived) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.archived ? 1 : -1;
      });

      return data.organizations;
    },
    select,
    retry,
  });
};

export const useGetAllOrganizations = (retry?: boolean) => {
  return useOrganizationsQuery(data => {
    return data.sort((a, b) => (a.archived && b.archived ? 0 : a.archived ? 1 : -1));
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

export const useGetOrganizationIsValid = (organizationId?: string) => {
  return useOrganizationsQuery(data => {
    const org = data.find(o => o.id === organizationId);
    return !!org && !org.suspended && !org.archived;
  });
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
