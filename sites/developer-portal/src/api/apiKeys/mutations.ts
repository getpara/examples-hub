import { axiosClient } from '../../clients/axios';
import { ApiKeyResponse, LogoUploadUrlResponse, PartnerAssetType, UpdateApiKeyBody } from '../../types/api';

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
  userId: string;
};
export const deleteApiKeyUser = async ({ organizationId, projectId, keyId, env, userId }: DeleteApiKeyUserVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/${env}/keys/${keyId}/users/${userId}`;

  return !!(await axiosClient.delete<boolean>(endpoint)).data;
};
