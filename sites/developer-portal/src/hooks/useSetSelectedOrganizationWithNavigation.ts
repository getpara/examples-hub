import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAppStore } from '../stores/app/useAppStore';
import { useGetAllOrganizations } from './api/queries/useOrganizations';
import { useLogout } from './useLogout';
import { useAccount } from '@getpara/react-sdk';
import { toast } from '@getpara/react-component-library';

export const useSetSelectedOrganizationWithNavigation = (shouldRefetch: boolean) => {
  const { data: account } = useAccount();
  const { organizationId } = useParams();
  const { data: allUserOrgs, error: allUserOrgsError, refetch: refetchOrgs } = useGetAllOrganizations(false);
  const setStoredSelectedOrganization = useAppStore(state => state.setSelectedOrganization);
  const getSelectedOrganization = useAppStore(state => state.getSelectedOrganization);
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const setSelectedOrganization = async () => {
    if (!account?.isConnected) {
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
      toast.error('Error Loading Organizations', {
        description: 'Please try to login again. If the problem persists, contact Para support.',
      });
      await logout();
    }

    // If user has any organizations, set selected to the first or the previously selected (if it's a valid org)
    if (_allUserOrgs?.length) {
      const userId = account.userId;
      const storedOrgId = getSelectedOrganization(userId!);
      let selectedOrgId = organizationId ?? storedOrgId;

      const validSelectedOrg = _allUserOrgs.find(o => o.id === selectedOrgId);

      if ((!storedOrgId || storedOrgId !== selectedOrgId) && validSelectedOrg) {
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
