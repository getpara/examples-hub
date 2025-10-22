import { PropsWithChildren, useEffect } from 'react';
import { useGetAllOrganizationsWithAccess } from '../../hooks/api/queries/useOrganizations';
import { useLogout } from '../../hooks/useLogout';
import { MainLoader } from '../MainLoader';
import { useSetSelectedOrganizationWithNavigation } from '../../hooks/useSetSelectedOrganizationWithNavigation';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '@getpara/react-sdk';

interface AuthenticatedWrapperProps extends PropsWithChildren {
  flow: 'ONBOARDING' | 'ORGANIZATION' | 'INVITE';
}

export const AuthenticatedWrapper = ({ flow, children }: AuthenticatedWrapperProps) => {
  const { isConnected, isLoading: isLoadingLoggedIn } = useAccount();
  const { logout } = useLogout();
  const { data: orgsWithAccess, isLoading: isLoadingOrgs } = useGetAllOrganizationsWithAccess();
  const { setSelectedOrganization } = useSetSelectedOrganizationWithNavigation(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle onboarding nav when user has orgs
    if (flow === 'ONBOARDING' && orgsWithAccess?.length) {
      setSelectedOrganization();
    }
    // Handle org nav when user has no orgs
    if (flow === 'ORGANIZATION' && !orgsWithAccess?.length) {
      navigate(`/onboarding`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow, orgsWithAccess?.length]);

  if (isLoadingLoggedIn) {
    return <MainLoader />;
  }

  if (!isConnected) {
    logout();
    return null;
  }

  if (isLoadingOrgs) {
    return <MainLoader />;
  }

  if (flow === 'ORGANIZATION' && !orgsWithAccess?.length) {
    return null;
  }

  if (flow === 'ONBOARDING' && orgsWithAccess?.length) {
    return null;
  }

  return children;
};
