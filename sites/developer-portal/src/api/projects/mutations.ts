import { axiosClient } from '../../clients/axios';
import { LogoUploadUrlResponse, ProjectResponse, UpdateProjectBody } from '../../types/api';

export type UpdateProjectVars = {
  organizationId: string;
  projectId: string;
  data: UpdateProjectBody;
};
export const updateProject = async ({ organizationId, projectId, data }: UpdateProjectVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}`;

  return (await axiosClient.patch<boolean>(endpoint, data)).data;
};

export type CreateProjectVars = {
  organizationId: string;
  data: UpdateProjectBody;
};
export const createProject = async ({ organizationId, data }: CreateProjectVars) => {
  const endpoint = `/organizations/${organizationId}/projects`;

  return (await axiosClient.post<ProjectResponse>(endpoint, data)).data;
};

export type GetLogoUploadUrlVars = {
  organizationId: string;
  projectId: string;
  fileExt: string;
};
export const getLogoUploadUrl = async ({ organizationId, projectId, fileExt }: GetLogoUploadUrlVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/logo-upload-url`;

  return (
    await axiosClient.post<LogoUploadUrlResponse>(endpoint, {
      fileExt,
    })
  ).data;
};

export type ArchiveProjectVars = {
  organizationId: string;
  projectId: string;
};
export const archiveProject = async ({ organizationId, projectId }: ArchiveProjectVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}`;

  return (await axiosClient.delete<boolean>(endpoint)).data;
};

export type RestoreProjectVars = {
  organizationId: string;
  projectId: string;
};
export const restoreProject = async ({ organizationId, projectId }: RestoreProjectVars) => {
  const endpoint = `/organizations/${organizationId}/projects/${projectId}/restore`;

  return (await axiosClient.patch<boolean>(endpoint)).data;
};
