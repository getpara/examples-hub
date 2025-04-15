import { axiosClient } from '../../clients/axios';
import {
  ApiKeyMonthlyActiveUsersTSResponse,
  ApiKeyResponse,
  ApiKeySetupStatusResponse,
  ApiKeyTotalUsersTSResponse,
  ApiKeyUsersLoginMetricsResponse,
  ApiKeysResponse,
  UsersTableDataResponse,
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
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/analytics/users-table-data`;

  return axiosClient.get<UsersTableDataResponse>(endpoint, {
    params: {
      offset,
      limit,
    },
  });
};

export const getApiKeyUsersLoginMetrics = async (organizationId: string, projectId: string, keyId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/analytics/login-metrics`;

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

/**
 * Checks if the given API key's Apple Passkey configuration is verified
 * using the teamId and bundleIdentifier stored in the API key.
 */
export const checkApplePasskeyVerification = async (
  organizationId: string,
  projectId: string,
  keyId: string,
  env: string,
): Promise<boolean> => {
  try {
    // Call our backend endpoint using the organizationProjectApiKeyRouter
    const url = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/apple-passkey-verification`;
    const response = await axiosClient.get(url);
    return response.data.verified === true;
  } catch (error) {
    console.error('Error checking Apple passkey verification:', error);
    return false;
  }
};
