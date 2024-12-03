import { axiosClient } from '../../clients/axios';
import {
  CreateCheckoutSessionResponse,
  CreateCustomerPortalSessionResponse,
  LogoUploadUrlResponse,
  UpdateOrganizationBody,
} from '../../types/api';

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
