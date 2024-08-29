import { axiosClient } from '../../clients/axios';
import { LogoUploadUrlResponse, UpdateOrganizationBody } from '../../types/api';

export const updateOrganization = async (organizationId: string, body: UpdateOrganizationBody) => {
  const endpoint = `/organizations/${organizationId}/`;

  return axiosClient.patch<boolean>(endpoint, body);
};

export type ChangePlanVars = { organizationId: string; newPlanSlug: string };
export const upgradePlan = async ({ organizationId, newPlanSlug }: ChangePlanVars) => {
  const endpoint = `/organizations/${organizationId}/upgrade-plan`;

  return (await axiosClient.post<boolean>(endpoint, { newPlanSlug })).data;
};

export const downgradePlan = async ({ organizationId, newPlanSlug }: ChangePlanVars) => {
  const endpoint = `/organizations/${organizationId}/downgrade-plan`;

  return (await axiosClient.post<boolean>(endpoint, { newPlanSlug })).data;
};

export const cancelPlan = async ({ organizationId }: { organizationId: string }) => {
  const endpoint = `/organizations/${organizationId}/cancel-plan`;

  return (await axiosClient.post<boolean>(endpoint)).data;
};

export type RequestEarlyAccessVars = { organizationId: string; slug: string };
export const requestEarlyAccess = async ({ organizationId, slug }: RequestEarlyAccessVars) => {
  const endpoint = `/organizations/${organizationId}/request-early-access`;

  return (await axiosClient.post<boolean>(endpoint, { earlyAccessItemSlug: slug })).data;
};

export type GetLogoUploadUrlVars = { organizationId: string; fileExt: string };
export const getLogoUploadUrl = async ({ organizationId, fileExt }: GetLogoUploadUrlVars) => {
  const endpoint = `/organizations/${organizationId}/logo-upload-url`;

  return (
    await axiosClient.post<LogoUploadUrlResponse>(endpoint, {
      fileExt,
    })
  ).data;
};
