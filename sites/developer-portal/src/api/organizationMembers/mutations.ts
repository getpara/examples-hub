import { axiosClient } from '../../clients/axios';
import { MemberRoleType, UpdateOrganizationMemberBody } from '../../types/api';

export type RemoveMemberVars = {
  organizationId: string;
  memberId: string;
};
export const removeMember = async ({ organizationId, memberId }: RemoveMemberVars) => {
  const endpoint = `/organizations/${organizationId}/members/${memberId}`;

  return (await axiosClient.delete<boolean>(endpoint)).data;
};

export type UpdateMemberVars = {
  organizationId: string;
  memberId: string;
  data: UpdateOrganizationMemberBody;
};
export const updateMember = async ({ organizationId, memberId, data }: UpdateMemberVars) => {
  const endpoint = `/organizations/${organizationId}/members/${memberId}`;

  return (await axiosClient.patch<boolean>(endpoint, data)).data;
};

export type InviteMemberVars = { organizationId: string; email: string; role: MemberRoleType; projectIds?: string[] };
export const inviteMember = async ({ organizationId, email, role, projectIds }: InviteMemberVars) => {
  const endpoint = `/organizations/${organizationId}/members/invite`;

  return (await axiosClient.post<boolean>(endpoint, { email, role, projectIds })).data;
};
