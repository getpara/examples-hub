import { PropsWithChildren, useEffect } from 'react';
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn';
import { useGetAllOrganizationsWithAccess } from '../../hooks/api/queries/useOrganizations';
import { useLogout } from '../../hooks/useLogout';
import { useOrganizationMember } from '../../hooks/api/queries/useOrganizationMember';
import { MainLoader } from '../MainLoader';
import { useSetSelectedOrganizationWithNavigation } from '../../hooks/useSetSelectedOrganizationWithNavigation';
import { AUTH_APP_BAR_HEIGHT } from '../AppBar/AuthAppBar';
import { useGetOrganizationSubscription } from '../../hooks/api/queries/useOrganizationSubscription';
import { usePlans } from '../../hooks/api/queries/usePlans';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AUTH_MIN_APP_BAR_HEIGHT } from '../AppBar/AuthMinAppBar';
import { useGetInvite } from '../../hooks/api/queries/useUserInvite';
import { triggerToast } from '../../utils/toasts';

interface AuthenticatedWrapperProps extends PropsWithChildren {
  requireOrgs?: boolean;
}

export const AuthenticatedWrapper = ({ requireOrgs, children }: AuthenticatedWrapperProps) => {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const { logout } = useLogout();
  const inviteId = searchParams.get('invite');
  const [inviteOrgId, inviteMemberId] = inviteId?.split('|') ?? [];
  const { data: invite, isLoading: isLoadingInvite } = useGetInvite(inviteOrgId, inviteMemberId);
  const { isLoggedIn, isLoading: isLoadingLoggedIn } = useIsLoggedIn();
  const { isLoading: isLoadingSubscription } = useGetOrganizationSubscription();
  const { isLoading: isLoadingPlans } = usePlans();
  const { isLoading: isLoadingMember } = useOrganizationMember();
  const { data: orgsWithAccess, isLoading: isLoadingOrgs } = useGetAllOrganizationsWithAccess();
  const { setSelectedOrganization } = useSetSelectedOrganizationWithNavigation(false);

  const isInvite = pathname.includes('/invite');
  const isOnboarding = !isInvite && pathname.includes('/onboarding');

  // invite route useEffect
  useEffect(() => {
    if (isInvite && !isLoadingLoggedIn) {
      if (isLoggedIn && !isLoadingInvite) {
        if (inviteId && !invite) {
          triggerToast({
            variant: 'error',
            title: 'Invite not found',
            body: 'Please try again. If the problem persists, contact Capsule support.',
          });
          setSelectedOrganization();
        }
      }
    }
  }, [isLoggedIn, isLoadingInvite, isLoadingLoggedIn, inviteId, invite, setSelectedOrganization, isInvite]);

  // onboarding route useEffect
  useEffect(() => {
    if (isOnboarding && !isLoadingLoggedIn) {
      if (isLoggedIn && !isLoadingOrgs && orgsWithAccess?.length) {
        setSelectedOrganization();
      }
    }
  }, [isLoadingLoggedIn, isLoadingOrgs, isLoggedIn, isOnboarding, orgsWithAccess?.length, setSelectedOrganization]);

  // default route useEffect
  useEffect(() => {
    if (!isOnboarding && !isInvite && !isLoadingLoggedIn) {
      if (isLoggedIn && !isLoadingOrgs && orgsWithAccess?.length) {
        setSelectedOrganization();
      }
    }
  }, []);

  const appBarHeight = isInvite || isOnboarding ? AUTH_MIN_APP_BAR_HEIGHT : AUTH_APP_BAR_HEIGHT;

  if (isLoadingLoggedIn || isLoadingOrgs || isLoadingMember || isLoadingSubscription || isLoadingPlans || isLoadingInvite) {
    return <MainLoader headerHeight={appBarHeight} />;
  }

  if (!isLoggedIn) {
    logout();
    return null;
  }

  if (requireOrgs && !orgsWithAccess?.length) {
    return null;
  }

  return children;
};
