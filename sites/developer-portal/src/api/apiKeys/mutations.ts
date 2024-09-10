import { axiosClient } from '../../clients/axios';
import {
  ApiKeyResponse,
  CreateApiKeyBody,
  LogoUploadUrlResponse,
  PartnerAssetType,
  UpdateApiKeyBody,
} from '../../types/api';

export type CreateApiKeyVars = {
  organizationId: string;
  env: string;
  data: CreateApiKeyBody;
};
export const createApiKey = async ({ organizationId, env, data }: CreateApiKeyVars) => {
  const endpoint = `/organizations/${organizationId}/${env}/keys/`;

  return (await axiosClient.post<ApiKeyResponse>(endpoint, data)).data;
};

export type UpdateApiKeyVars = {
  organizationId: string;
  keyId: string;
  env: string;
  data: UpdateApiKeyBody;
};
export const updateApiKey = async ({ organizationId, keyId, env, data }: UpdateApiKeyVars) => {
  const endpoint = `/organizations/${organizationId}/${env}/keys/${keyId}`;

  return (await axiosClient.patch<boolean>(endpoint, data)).data;
};

export type ArchiveApiKeyVars = {
  organizationId: string;
  keyId: string;
  env: string;
};
export const archiveApiKey = async ({ organizationId, keyId, env }: RotateApiKeyVars) => {
  const endpoint = `/organizations/${organizationId}/${env}/keys/${keyId}`;

  return (await axiosClient.delete<boolean>(endpoint)).data;
};

export type RotateApiKeyVars = {
  organizationId: string;
  keyId: string;
  env: string;
};
export const rotateApiKey = async ({ organizationId, keyId, env }: RotateApiKeyVars) => {
  const endpoint = `/organizations/${organizationId}/${env}/keys/${keyId}/rotate`;

  return (await axiosClient.post<{ newKey: string }>(endpoint)).data.newKey;
};

export type GetLogoUploadUrlVars = {
  assetType?: PartnerAssetType;
  organizationId: string;
  keyId: string;
  env: string;
  fileExt: string;
};
export const getKeyAssetUploadUrl = async ({
  assetType = PartnerAssetType.LOGOS,
  organizationId,
  keyId,
  env,
  fileExt,
}: GetLogoUploadUrlVars) => {
  const endpoint = `/organizations/${organizationId}/${env}/keys/${keyId}/logo-upload-url`;

  return (
    await axiosClient.post<LogoUploadUrlResponse>(endpoint, {
      assetType,
      fileExt,
    })
  ).data;
};

export type DeleteApiKeyUserVars = {
  organizationId: string;
  keyId: string;
  env: string;
  userId: string;
};
export const deleteApiKeyUser = async ({ organizationId, keyId, env, userId }: DeleteApiKeyUserVars) => {
  const endpoint = `/organizations/${organizationId}/${env}/keys/${keyId}/users/${userId}`;

  return !!(await axiosClient.delete<boolean>(endpoint)).data;
};
