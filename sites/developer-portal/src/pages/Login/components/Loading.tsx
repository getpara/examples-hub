import { capsule } from '../../../clients/capsule';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useGetAllOrganizations } from '../../../hooks/api/queries/useOrganizations';
import { useAppStore } from '../../../stores/app/useAppStore';
import { CpslSpinner } from '@usecapsule/react-components';
import { useLogout } from '../../../hooks/useLogout';
import { useGetAllInvites } from '../../../hooks/api/queries/useUserInvites';
import { useAcceptInvite } from '../../../hooks/api/mutations/useAcceptInvite';
import { triggerToast } from '../../../utils/toasts';

interface LoadingProps {
  setIsLoading: (v: boolean) => void;
}

export const Loading = ({ setIsLoading }: LoadingProps) => {
  const { logout } = useLogout();
  const navigate = useNavigate();
  const { mutate: acceptInvite } = useAcceptInvite();
  // Don't retry getting orgs on error, immediately logout the user
  const { refetch: refetchOrgs } = useGetAllOrganizations(false);
  const { refetch: refetchInvites } = useGetAllInvites();
  const getSelectedOrganization = useAppStore(state => state.getSelectedOrganization);
  const setSelectedOrganization = useAppStore(state => state.setSelectedOrganization);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const isFullyLoggedIn = await capsule.isFullyLoggedIn();
    if (isFullyLoggedIn) {
      const { data: allUserOrgs, error: allUserOrgsError } = await refetchOrgs();

      if (allUserOrgsError) {
        triggerToast({
          variant: 'error',
          title: 'Error Loading Organizations',
          body: 'Please try to login again. If the problem persists, contact Capsule support.',
        });
        await logout();
      }

      // If user has any organizations, set selected to the first
      if (allUserOrgs?.length) {
        const selectedOrgId = getSelectedOrganization();

        let selectedOrg = allUserOrgs.find(o => o.id === selectedOrgId);

        if (!selectedOrgId || !selectedOrg) {
          setSelectedOrganization(allUserOrgs[0].id);
          selectedOrg = allUserOrgs[0];
        }

        if (selectedOrg.hasDevPortalAccess) {
          navigate('/', { replace: true });
        } else {
          navigate('/login/request-access', { replace: true });
        }
      } else {
        const { data: allInvites } = await refetchInvites();
        if (allInvites?.length) {
          acceptInvite(
            { organizationId: allInvites[0].id },
            {
              onSuccess: () => {
                setSelectedOrganization(allInvites[0].id);
                navigate('/', { replace: true });
              },
              onError: () => {
                triggerToast({
                  variant: 'error',
                  title: 'Error Accepting Invitation',
                  body: 'Please try to login again. If the problem persists, contact Capsule support.',
                });
                logout();
              },
            },
          );
        } else {
          navigate('/login/request-access', { replace: true });
        }
      }
    }
    setIsLoading(false);
  };

  return <CpslSpinner />;
};
