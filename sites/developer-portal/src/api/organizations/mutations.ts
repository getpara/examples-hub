import { axiosClient } from '../../clients/axios';
import {
  CreateCheckoutSessionResponse,
  CreateCustomerPortalSessionResponse,
  LogoUploadUrlResponse,
  UpdateOrganizationBody,
} from '../../types/api';

export type UpdateOrganizationVars = {
  organizationId: string;
  data: Partial<UpdateOrganizationBody>;
};
export const updateOrganization = async ({ organizationId, data }: UpdateOrganizationVars) => {
  const endpoint = `/organizations/${organizationId}/`;

  return (await axiosClient.patch<boolean>(endpoint, data)).data;
};

export type ChangePlanVars = { organizationId: string; planSlug: string; remainingProjectIds: string[] };
export const changePlan = async ({ organizationId, planSlug, remainingProjectIds }: ChangePlanVars) => {
  const endpoint = `/organizations/${organizationId}/stripe/subscription/change`;

  return (await axiosClient.post<{ success: boolean }>(endpoint, { planSlug, remainingProjectIds })).data;
};

export type CancelPlanVars = { organizationId: string; remainingProjectIds: string[] };
export const cancelPlan = async ({ organizationId, remainingProjectIds }: CancelPlanVars) => {
  const endpoint = `/organizations/${organizationId}/stripe/subscription/cancel`;

  return (await axiosClient.post<{ success: boolean }>(endpoint, { remainingProjectIds })).data;
};

export type ReinstatePlanVars = { organizationId: string };
export const reinstatePlan = async ({ organizationId }: ReinstatePlanVars) => {
  const endpoint = `/organizations/${organizationId}/stripe/subscription/reinstate`;

  return (await axiosClient.post<{ success: boolean }>(endpoint)).data;
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

export type CreateCheckoutSessionVars = { organizationId: string; planSlug: string; successUrl: string };
export const createCheckoutSession = async ({ organizationId, planSlug, successUrl }: CreateCheckoutSessionVars) => {
  const endpoint = `/organizations/${organizationId}/stripe/checkout-session`;

  return (
    await axiosClient.post<CreateCheckoutSessionResponse>(endpoint, {
      planSlug,
      successUrl,
    })
  ).data;
};

export type CustomerPortalFlow =
  | 'paymentMethodUpdate'
  | 'subscriptionCancel'
  | 'subscriptionUpdate'
  | 'subscriptionUpdateConfirm';
export type CreateCustomerPortalSessionVars = {
  organizationId: string;
  successUrl: string;
  flow?: CustomerPortalFlow;
  planSlug?: string;
};
export const createCustomerPortalSession = async ({
  organizationId,
  successUrl,
  flow,
  planSlug,
}: CreateCustomerPortalSessionVars) => {
  const endpoint = `/organizations/${organizationId}/stripe/customer-portal-session`;

  return (await axiosClient.post<CreateCustomerPortalSessionResponse>(endpoint, { flow, planSlug, successUrl })).data;
};

export type UpgradeSubscriptionVars = { organizationId: string; planSlug: string };
export const upgradeSubscription = async ({ organizationId, planSlug }: UpgradeSubscriptionVars) => {
  const endpoint = `/organizations/${organizationId}/stripe/subscription/upgrade`;

  return (await axiosClient.post<{ success: boolean }>(endpoint, { planSlug })).data;
};
