import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/app/useAppStore';
import { triggerToast } from '../utils/toasts';
import { useGetAllOrganizations } from './api/queries/useOrganizations';
import { useLogout } from './useLogout';

export const useSetSelectedOrganizationWithNavigation = (shouldRefetch: boolean) => {
  const { data: allUserOrgs, error: allUserOrgsError, refetch: refetchOrgs } = useGetAllOrganizations(false);
  const getSelectedOrganization = useAppStore(state => state.getSelectedOrganization);
  const setStoredSelectedOrganization = useAppStore(state => state.setSelectedOrganization);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const setSelectedOrganization = async () => {
    let _allUserOrgs = allUserOrgs;
    let _allUserOrgsError = allUserOrgsError;

    if (shouldRefetch) {
      const { data: allUserOrgs, error: allUserOrgsError } = await refetchOrgs();

      _allUserOrgs = allUserOrgs;
      _allUserOrgsError = allUserOrgsError;
    }

    if (_allUserOrgsError) {
      triggerToast({
        variant: 'error',
        title: 'Error Loading Organizations',
        body: 'Please try to login again. If the problem persists, contact Capsule support.',
      });
      await logout();
    }

    const allUserOrgsWithAccess = _allUserOrgs?.filter(o => o.hasDevPortalAccess);

    // If user has any organizations with access, set selected to the first or the previously selected (if it's a valid org)
    if (allUserOrgsWithAccess?.length) {
      const selectedOrgId = getSelectedOrganization();

      const validSelectedOrg = allUserOrgsWithAccess.find(o => o.id === selectedOrgId);

      if (!selectedOrgId || !validSelectedOrg) {
        setStoredSelectedOrganization(allUserOrgsWithAccess[0].id);
      }

      if (pathname.includes('/onboarding') || pathname.includes('/login')) {
        navigate('/', { replace: true });
      }
    } else {
      setStoredSelectedOrganization(_allUserOrgs?.find(o => !o.hasDevPortalAccess)?.id);
      if (!pathname.includes('/onboarding')) {
        navigate('/onboarding', { replace: true });
      }
    }
  };

  return { setSelectedOrganization };
};
