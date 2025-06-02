import { axiosClient } from '../../clients/axios';
import {
  OrganizationLoginMethodsTotalResponse,
  OrganizationLoginPlatformsTotalResponse,
  OrganizationMonthlyActiveUsersTSResponse,
  OrganizationResponse,
  OrganizationTotalUsersTSResponse,
  OrganizationUserMetricsResponse,
  OrganizationEnterprisePriceResponse,
  OrganizationSubscriptionResponse,
  OrganizationTotalUserCountResponse,
  UsersTableDataResponse,
  OrganizationPremiumFeaturesResponse,
  OrganizationTotalUserCountByProjectResponse,
} from '../../types/api';

export const getOrganization = async (organizationId: string) => {
  const endpoint = `/organizations/${organizationId}/`;

  return axiosClient.get<OrganizationResponse>(endpoint);
};

export const getOrganizationUserMetrics = async (organizationId: string, startDate?: Date, endDate?: Date) => {
  const endpoint = `/organizations/${organizationId}/login-metrics`;

  return axiosClient.get<OrganizationUserMetricsResponse>(endpoint, {
    params: {
      startDate,
      endDate,
    },
  });
};

export const getOrganizationTotalUsersTS = async (organizationId: string, startDate?: Date, endDate?: Date) => {
  const endpoint = `/organizations/${organizationId}/analytics/time-series/total-users`;

  return axiosClient.get<OrganizationTotalUsersTSResponse>(endpoint, {
    params: {
      startDate,
      endDate,
    },
  });
};

export const getOrganizationMonthlyActiveUsersTS = async (organizationId: string, startDate?: Date, endDate?: Date) => {
  const endpoint = `/organizations/${organizationId}/analytics/time-series/monthly-active-users`;

  return axiosClient.get<OrganizationMonthlyActiveUsersTSResponse>(endpoint, {
    params: {
      startDate,
      endDate,
    },
  });
};

export const getOrganizationLoginMethodsTotal = async (organizationId: string) => {
  const endpoint = `/organizations/${organizationId}/analytics/all-time/login-methods`;

  return axiosClient.get<OrganizationLoginMethodsTotalResponse>(endpoint);
};

export const getOrganizationLoginPlatformsTotal = async (organizationId: string) => {
  const endpoint = `/organizations/${organizationId}/analytics/all-time/login-platforms`;

  return axiosClient.get<OrganizationLoginPlatformsTotalResponse>(endpoint);
};

export const getOrganizationEnterprisePrice = async (organizationId: string) => {
  const endpoint = `/organizations/${organizationId}/stripe/enterprise-price`;

  return axiosClient.get<OrganizationEnterprisePriceResponse>(endpoint);
};

export const getOrganizationSubscription = async (organizationId: string) => {
  const endpoint = `/organizations/${organizationId}/stripe/subscription`;

  return axiosClient.get<OrganizationSubscriptionResponse>(endpoint);
};

export const getOrganizationTotalUserCount = async (organizationId: string) => {
  const endpoint = `/organizations/${organizationId}/analytics/all-time/user-count`;

  return axiosClient.get<OrganizationTotalUserCountResponse>(endpoint);
};

export const getOrganizationTotalUserCountByProject = async (organizationId: string) => {
  const endpoint = `/organizations/${organizationId}/analytics/all-time/user-count-by-project`;

  return axiosClient.get<OrganizationTotalUserCountByProjectResponse>(endpoint);
};

export const getOrganizationUsersTableData = async (
  organizationId: string,
  env: string,
  offset?: number,
  limit?: number,
) => {
  const endpoint = `/organizations/${organizationId}/analytics/users-table-data`;

  return axiosClient.get<UsersTableDataResponse>(endpoint, {
    params: {
      offset,
      limit,
      env,
    },
  });
};

export const getOrganizationPremiumFeatures = async (organizationId: string) => {
  const endpoint = `/organizations/${organizationId}/premium-features`;

  return axiosClient.get<OrganizationPremiumFeaturesResponse>(endpoint);
};
