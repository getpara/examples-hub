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

export const requestOrganizationAccess = (userId: string) => {
  const endpoint = `/users/${userId}/organizations/request-dev-portal-access`;

  return axiosClient.post<OrganizationResponse>(endpoint);
};
