import { axiosClient } from '../../clients/axios';
import { OrganizationResponse, OrganizationUserMetricsResponse } from '../../types/api';

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
