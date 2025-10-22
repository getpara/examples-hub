import { useLogoutContext } from '../providers/LogoutProvider';

export const useLogout = () => {
  return useLogoutContext();
};
