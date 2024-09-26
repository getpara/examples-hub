import { capsule } from '../../../clients/capsule';
import { useEffect } from 'react';
import { useLogout } from '../../../hooks/useLogout';
import { useGetAllInvites } from '../../../hooks/api/queries/useUserInvites';
import { useAcceptInvite } from '../../../hooks/api/mutations/useAcceptInvite';
import { triggerToast } from '../../../utils/toasts';
import { MainLoader } from '../../../components/MainLoader';
import { useSetSelectedOrganizationWithNavigation } from '../../../hooks/useSetSelectedOrganizationWithNavigation';
import { UNAUTH_APP_BAR_HEIGHT } from '../../../components/AppBar/UnAuthAppBar';

interface LoadingProps {
  setIsLoading: (v: boolean) => void;
}

export const Loading = ({ setIsLoading }: LoadingProps) => {
  const { logout } = useLogout();
  const { mutateAsync: acceptInvite } = useAcceptInvite();
  const { refetch: refetchInvites } = useGetAllInvites();
  const { setSelectedOrganization } = useSetSelectedOrganizationWithNavigation(true);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const isFullyLoggedIn = await capsule.isFullyLoggedIn();
    if (isFullyLoggedIn) {
      const { data: allInvites } = await refetchInvites();

      if (allInvites?.length) {
        const invitePromises: Promise<boolean>[] = [];

        allInvites.forEach(invite => invitePromises.push(acceptInvite({ organizationId: invite.id })));

        try {
          await Promise.all(allInvites);
        } catch (e) {
          triggerToast({
            variant: 'error',
            title: 'Error Accepting Invitation',
            body: 'Please try to login again. If the problem persists, contact Capsule support.',
          });
          await logout();
          return;
        }
      }

      // Set org (if available) and navigate to proper page
      await setSelectedOrganization();
    }
    setIsLoading(false);
  };

  return <MainLoader headerHeight={UNAUTH_APP_BAR_HEIGHT} />;
};
