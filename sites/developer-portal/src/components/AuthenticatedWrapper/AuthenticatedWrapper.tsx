import { PropsWithChildren, useEffect } from 'react';
import { useGetAllOrganizationsWithAccess } from '../../hooks/api/queries/useOrganizations';
import { useLogout } from '../../hooks/useLogout';
import { useOrganizationMember } from '../../hooks/api/queries/useOrganizationMember';
import { MainLoader } from '../MainLoader';
import { useSetSelectedOrganizationWithNavigation } from '../../hooks/useSetSelectedOrganizationWithNavigation';
import { useGetOrganizationSubscription } from '../../hooks/api/queries/useOrganizationSubscription';
import { usePlans } from '../../hooks/api/queries/usePlans';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useGetInvite } from '../../hooks/api/queries/useUserInvite';
import { useAccount } from '@getpara/react-sdk';
import { toast } from '@getpara/react-component-library';

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
  const { isConnected, isLoading: isLoadingLoggedIn } = useAccount();
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
      if (isConnected && !isLoadingInvite) {
        if (!inviteId || (inviteId && !invite)) {
          toast.error('Invite not found', {
            description: 'Please try again. If the problem persists, contact Para support.',
          });
          setSelectedOrganization();
        }
      }
    }
  }, [isConnected, isLoadingInvite, isLoadingLoggedIn, inviteId, invite, setSelectedOrganization, isInvite]);

  // onboarding route useEffect
  useEffect(() => {
    if (isOnboarding && !isLoadingLoggedIn) {
      if (isConnected && !isLoadingOrgs && orgsWithAccess?.length) {
        setSelectedOrganization();
      }
    }
  }, [isLoadingLoggedIn, isLoadingOrgs, isConnected, isOnboarding, orgsWithAccess?.length, setSelectedOrganization]);

  // default route useEffect
  useEffect(() => {
    if (!isOnboarding && !isInvite && !isLoadingLoggedIn) {
      if (isConnected && !isLoadingOrgs && orgsWithAccess?.length) {
        setSelectedOrganization();
      }
    }
  }, [
    isInvite,
    isLoadingLoggedIn,
    isLoadingOrgs,
    isConnected,
    isOnboarding,
    orgsWithAccess?.length,
    setSelectedOrganization,
  ]);

  if (isLoadingLoggedIn || isLoadingOrgs || isLoadingMember || isLoadingSubscription || isLoadingPlans || isLoadingInvite) {
    return <MainLoader />;
  }

  if (!isConnected) {
    logout();
    return null;
  }

  if (requireOrgs && !orgsWithAccess?.length) {
    return null;
  }

  return children;
};
