import { MemberRoleType } from '../types/api';

export const formatRole = (role: MemberRoleType) => {
  switch (role) {
    case 'ORG_OWNER': {
      return 'Org Owner';
    }
    case 'ORG_MEMBER': {
      return 'Org Member';
    }
    default:
    case 'PROJECT_MEMBER': {
      return 'Project Member';
    }
  }
};
