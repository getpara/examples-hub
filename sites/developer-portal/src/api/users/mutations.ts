import { axiosClient } from '../../clients/axios';
import { OrganizationResponse } from '../../types/api';

export type AcceptInviteVars = {
  userId: string;
  organizationId: string;
};
export const acceptOrganizationInvite = async ({ userId, organizationId }: AcceptInviteVars) => {
  const endpoint = `/users/${userId}/organizations/${organizationId}/accept-invite`;

  return (await axiosClient.post<boolean>(endpoint)).data;
};

export type RequestOrganizationAccessVars = {
  userId: string;
  organizationName: string;
};
export const requestOrganizationAccess = async ({ userId, organizationName }: RequestOrganizationAccessVars) => {
  const endpoint = `/users/${userId}/organizations/request-dev-portal-access`;

  return (await axiosClient.post<OrganizationResponse>(endpoint, { organizationName })).data;
};
