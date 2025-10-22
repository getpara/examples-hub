import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../stores/app/useAppStore';
import { useGetAllOrganizations } from './api/queries/useOrganizations';
import { useLogout } from './useLogout';
import { useAccount } from '@getpara/react-sdk';
import { toast } from '@getpara/react-component-library';

export const useSetSelectedOrganizationWithNavigation = (shouldRefetch: boolean) => {
  const {
    isConnected,
    embedded: { userId },
  } = useAccount();
  const { organizationId } = useParams();
  const { data: allUserOrgs, error: allUserOrgsError, refetch: refetchOrgs } = useGetAllOrganizations(false);
  const setStoredSelectedOrganization = useAppStore(state => state.setSelectedOrganization);
  const getSelectedOrganization = useAppStore(state => state.getSelectedOrganization);
  const { logout } = useLogout();
  const navigate = useNavigate();

  const setSelectedOrganization = async () => {
    if (!isConnected) {
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

      navigate(`${pathStart}/dashboard`, { replace: true });
    } else {
      console.error('No organizations found for user:', { userId });
      await logout();
    }
  };

  return { setSelectedOrganization };
};
