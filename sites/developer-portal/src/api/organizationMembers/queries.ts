import { axiosClient } from '../../clients/axios';
import { OrganizationMemberResponse, OrganizationMembersResponse } from '../../types/api';

export const getOrganizationMembers = async (organizationId: string) => {
  const endpoint = `/organizations/${organizationId}/members/`;

  return axiosClient.get<OrganizationMembersResponse>(endpoint);
};

export const getOrganizationMember = async (organizationId: string, memberId: string) => {
  const endpoint = `/organizations/${organizationId}/members/${memberId}`;

  return axiosClient.get<OrganizationMemberResponse>(endpoint);
};
