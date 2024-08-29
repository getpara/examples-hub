import { axiosClient } from '../../clients/axios';
import { OrganizationMemberResponse, OrganizationsResponse } from '../../types/api';

export const getOrganizations = async (userId: string) => {
  const endpoint = `/users/${userId}/organizations/`;

  return axiosClient.get<OrganizationsResponse>(endpoint);
};

export const getOrganizationInvites = async (userId: string) => {
  const endpoint = `/users/${userId}/organizations/invites`;

  return axiosClient.get<OrganizationsResponse>(endpoint);
};

export const getOrganizationMember = async (userId: string, organizationId: string) => {
  const endpoint = `/users/${userId}/organizations/${organizationId}/member`;

  return axiosClient.get<OrganizationMemberResponse>(endpoint);
};
