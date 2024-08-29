import { axiosClient } from '../../clients/axios';
import {
  ApiKeyResponse,
  ApiKeyUsersLoginMetricsResponse,
  ApiKeyUsersTableDataResponse,
  ApiKeysResponse,
} from '../../types/api';

export const getApiKeys = async (organizationId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/${env}/keys`;

  return axiosClient.get<ApiKeysResponse>(endpoint);
};

export const getApiKey = async (organizationId: string, keyId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/${env}/keys/${keyId}`;

  return axiosClient.get<ApiKeyResponse>(endpoint);
};

export const getApiKeyUsersTableData = async (
  organizationId: string,
  keyId: string,
  env: string,
  offset?: number,
  limit?: number,
) => {
  const endpoint = `/organizations/${organizationId}/${env}/keys/${keyId}/logins/table-data`;

  return axiosClient.get<ApiKeyUsersTableDataResponse>(endpoint, {
    params: {
      offset,
      limit,
    },
  });
};

export const getApiKeyUsersLoginMetrics = async (organizationId: string, keyId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/${env}/keys/${keyId}/logins/login-metrics`;

  return axiosClient.get<ApiKeyUsersLoginMetricsResponse>(endpoint);
};
