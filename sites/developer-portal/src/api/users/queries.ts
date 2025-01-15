import { axiosClient } from '../../clients/axios';
import { OrganizationMemberResponse, OrganizationsInviteResponse, OrganizationsResponse } from '../../types/api';

export const getOrganizations = async (userId: string) => {
  const endpoint = `/users/${userId}/organizations/`;

  return axiosClient.get<OrganizationsResponse>(endpoint);
};

export const getOrganizationInvites = async (userId: string, organizationId: string, memberId: string) => {
  const endpoint = `/users/${userId}/organizations/${organizationId}/invites/${memberId}`;

  return axiosClient.get<OrganizationsInviteResponse>(endpoint);
};

export const getOrganizationMember = async (userId: string, organizationId: string) => {
  const endpoint = `/users/${userId}/organizations/${organizationId}/member`;

  return axiosClient.get<OrganizationMemberResponse>(endpoint);
};
