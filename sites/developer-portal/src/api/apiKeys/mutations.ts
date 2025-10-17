import { axiosClient } from '../../clients/axios';
import {
  ApiKeyIpAllowlistResponse,
  ApiKeyResponse,
  LogoUploadUrlResponse,
  PartnerAssetType,
  UpdateApiKeyBody,
} from '../../types/api';

export type CreateApiKeyVars = {
  organizationId: string;
  projectId: string;
  env: string;
  data: Pick<UpdateApiKeyBody, 'homepageUrl'>;
};
export const createApiKey = async ({ organizationId, projectId, env, data }: CreateApiKeyVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/`;

  return (await axiosClient.post<ApiKeyResponse>(endpoint, data)).data;
};

export type UpdateApiKeyVars = {
  organizationId: string;
  projectId: string;
  keyId: string;
  env: string;
  data: UpdateApiKeyBody;
};
export const updateApiKey = async ({ organizationId, projectId, keyId, env, data }: UpdateApiKeyVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}`;

  return (await axiosClient.patch<boolean>(endpoint, data)).data;
};

export type UpdateApiKeyAllowlistVars = {
  organizationId: string;
  projectId: string;
  keyId: string;
  env: string;
  allowlistCidrs: string[];
};
export const updateApiKeyAllowlist = async ({
  organizationId,
  projectId,
  keyId,
  env,
  allowlistCidrs,
}: UpdateApiKeyAllowlistVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/ip-allowlist`;

  return (
    await axiosClient.put<ApiKeyIpAllowlistResponse>(endpoint, {
      allowlistCidrs,
    })
  ).data;
};

export type ArchiveApiKeyVars = {
  organizationId: string;
  projectId: string;
  keyId: string;
  env: string;
};
export const archiveApiKey = async ({ organizationId, projectId, keyId, env }: RotateApiKeyVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}`;

  return (await axiosClient.delete<boolean>(endpoint)).data;
};

export type RotateApiKeyVars = {
  organizationId: string;
  projectId: string;
  keyId: string;
  env: string;
};
export const rotateApiKey = async ({ organizationId, projectId, keyId, env }: RotateApiKeyVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/rotate`;

  return (await axiosClient.post<{ newKey: string }>(endpoint)).data.newKey;
};

export type RotateSecretApiKeyVars = {
  organizationId: string;
  projectId: string;
  keyId: string;
  env: string;
};
export const rotateSecretApiKey = async ({ organizationId, projectId, keyId, env }: RotateSecretApiKeyVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/rotate-secret-key`;

  return (await axiosClient.post<{ newKey: string }>(endpoint)).data.newKey;
};

export type GetLogoUploadUrlVars = {
  assetType?: PartnerAssetType;
  organizationId: string;
  projectId: string;
  keyId: string;
  env: string;
  fileExt: string;
};
export const getKeyAssetUploadUrl = async ({
  assetType = PartnerAssetType.LOGOS,
  organizationId,
  projectId,
  keyId,
  env,
  fileExt,
}: GetLogoUploadUrlVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/logo-upload-url`;

  return (
    await axiosClient.post<LogoUploadUrlResponse>(endpoint, {
      assetType,
      fileExt,
    })
  ).data;
};

export type DeleteApiKeyUserVars = {
  organizationId: string;
  projectId: string;
  keyId: string;
  env: string;
  id: string;
};
export const deleteApiKeyUser = async ({ organizationId, projectId, keyId, env, id }: DeleteApiKeyUserVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/users/${id}`;

  return !!(await axiosClient.delete<boolean>(endpoint)).data;
};

export type DeleteApiKeyUsersVars = {
  organizationId: string;
  projectId: string;
  keyId: string;
  env: string;
};
export const deleteApiKeyUsers = async ({ organizationId, projectId, keyId, env }: DeleteApiKeyUsersVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/users/bulk-delete`;

  return !!(await axiosClient.post<boolean>(endpoint)).data;
};

export type DeletePregenWalletVars = {
  organizationId: string;
  projectId: string;
  keyId: string;
  env: string;
  id: string;
};
export const deletePregenWallet = async ({ organizationId, projectId, keyId, env, id }: DeletePregenWalletVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/pregen/${id}`;

  return !!(await axiosClient.delete<boolean>(endpoint)).data;
};
