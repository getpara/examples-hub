import { axiosClient } from '../../clients/axios';
import {
  ApiKeyLoginMethodsTotalResponse,
  ApiKeyLoginPlatformsTotalResponse,
  ApiKeyMonthlyActiveUsersTSResponse,
  ApiKeyResponse,
  ApiKeySetupStatusResponse,
  ApiKeyTotalUserCountResponse,
  ApiKeyTotalUsersTSResponse,
  ApiKeyUsersLoginMetricsResponse,
  ApiKeysResponse,
  ApiKeyIpAllowlistResponse,
  UsersTableDataResponse,
} from '../../types/api';
import { LoginMethod } from '../../types/loginMethod';

export const getApiKeys = async (organizationId: string, projectId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys`;

  return axiosClient.get<ApiKeysResponse>(endpoint);
};

export const getApiKey = async (organizationId: string, projectId: string, keyId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}`;

  return axiosClient.get<ApiKeyResponse>(endpoint);
};

export const getApiKeyIpAllowlist = async (organizationId: string, projectId: string, keyId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/ip-allowlist`;

  return axiosClient.get<ApiKeyIpAllowlistResponse>(endpoint);
};

export const getApiKeyUsersTableData = async (
  organizationId: string,
  projectId: string,
  keyId: string,
  env: string,
  offset?: number,
  limit?: number,
  methods?: LoginMethod[],
) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/analytics/users-table-data`;

  return axiosClient.get<UsersTableDataResponse>(endpoint, {
    params: {
      offset,
      limit,
      methods,
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

export const getApiKeyLoginMethodsTotal = async (organizationId: string, projectId: string, keyId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/analytics/all-time/login-methods`;

  return axiosClient.get<ApiKeyLoginMethodsTotalResponse>(endpoint);
};

export const getApiKeyLoginPlatformsTotal = async (
  organizationId: string,
  projectId: string,
  keyId: string,
  env: string,
) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/analytics/all-time/login-platforms`;

  return axiosClient.get<ApiKeyLoginPlatformsTotalResponse>(endpoint);
};

export const getApiKeyTotalUserCount = async (organizationId: string, projectId: string, keyId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/analytics/all-time/user-count`;

  return axiosClient.get<ApiKeyTotalUserCountResponse>(endpoint);
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

export const getUsersCSV = async (organizationId: string, projectId: string, keyId: string, env: string) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/analytics/export-users`;

  return axiosClient.get<Blob>(endpoint, {
    responseType: 'blob',
    params: {
      key: new Date().getTime(),
    },
  });
};
