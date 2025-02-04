import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAppStore } from '../stores/app/useAppStore';
import { triggerToast } from '../utils/toasts';
import { useGetAllOrganizations } from './api/queries/useOrganizations';
import { useLogout } from './useLogout';
import { para } from '../clients/para';

export const useSetSelectedOrganizationWithNavigation = (shouldRefetch: boolean) => {
  const { organizationId } = useParams();
  const { data: allUserOrgs, error: allUserOrgsError, refetch: refetchOrgs } = useGetAllOrganizations(false);
  const setStoredSelectedOrganization = useAppStore(state => state.setSelectedOrganization);
  const getSelectedOrganization = useAppStore(state => state.getSelectedOrganization);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const setSelectedOrganization = async () => {
    const isFullyLoggedIn = await para.isFullyLoggedIn();

    if (!isFullyLoggedIn) {
      return;
    }

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
        body: 'Please try to login again. If the problem persists, contact Para support.',
      });
      await logout();
    }

    // If user has any organizations, set selected to the first or the previously selected (if it's a valid org)
    if (_allUserOrgs?.length) {
      const userId = para.getUserId();
      const storedOrgId = getSelectedOrganization(userId!);
      let selectedOrgId = organizationId ?? storedOrgId;

      const validSelectedOrg = _allUserOrgs.find(o => o.id === selectedOrgId);

      if (!storedOrgId && validSelectedOrg) {
        setStoredSelectedOrganization(selectedOrgId);
      }

      if (!validSelectedOrg) {
        selectedOrgId = _allUserOrgs[0].id;
        setStoredSelectedOrganization(selectedOrgId);
      }

      const pathStart = `/${selectedOrgId}`;

      if (pathname.includes('/onboarding') || !pathname.startsWith(pathStart)) {
        navigate(`${pathStart}/dashboard`, { replace: true });
      }
    } else {
      navigate(`/onboarding`, { replace: true });
    }
  };

  return { setSelectedOrganization };
};
