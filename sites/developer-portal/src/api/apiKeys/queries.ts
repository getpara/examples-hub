import { axiosClient } from '../../clients/axios';
import {
  ApiKeyMonthlyActiveUsersTSResponse,
  ApiKeyResponse,
  ApiKeySetupStatusResponse,
  ApiKeyTotalUsersTSResponse,
  ApiKeyUsersLoginMetricsResponse,
  ApiKeyUsersTableDataResponse,
  ApiKeysResponse,
} from '../../types/api';

export const getApiKeys = async (organizationId: string, projectId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys`;

  return axiosClient.get<ApiKeysResponse>(endpoint);
};

export const getApiKey = async (organizationId: string, projectId: string, keyId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}`;

  return axiosClient.get<ApiKeyResponse>(endpoint);
};

export const getApiKeyUsersTableData = async (
  organizationId: string,
  projectId: string,
  keyId: string,
  env: string,
  offset?: number,
  limit?: number,
) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/logins/table-data`;

  return axiosClient.get<ApiKeyUsersTableDataResponse>(endpoint, {
    params: {
      offset,
      limit,
    },
  });
};

export const getApiKeyUsersLoginMetrics = async (organizationId: string, projectId: string, keyId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/logins/login-metrics`;

  return axiosClient.get<ApiKeyUsersLoginMetricsResponse>(endpoint);
};

export const getApiKeySetupStatus = async (organizationId: string, projectId: string, keyId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/setup-status`;

  return axiosClient.get<ApiKeySetupStatusResponse>(endpoint);
};

export const getApiKeyTotalUsersTS = async (
  organizationId: string,
  projectId: string,
  keyId: string,
  env: string,
  startDate?: Date,
  endDate?: Date,
) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/analytics/time-series/total-users`;

  return axiosClient.get<ApiKeyTotalUsersTSResponse>(endpoint, {
    params: {
      startDate,
      endDate,
    },
  });
};

export const getApiKeyMonthlyActiveUsersTS = async (
  organizationId: string,
  projectId: string,
  keyId: string,
  env: string,
  startDate?: Date,
  endDate?: Date,
) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/analytics/time-series/monthly-active-users`;

  return axiosClient.get<ApiKeyMonthlyActiveUsersTSResponse>(endpoint, {
    params: {
      startDate,
      endDate,
    },
  });
};
