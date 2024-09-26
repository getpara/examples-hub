import { PropsWithChildren, useEffect } from 'react';
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn';
import { useGetAllOrganizationsWithAccess } from '../../hooks/api/queries/useOrganizations';
import { useLogout } from '../../hooks/useLogout';
import { useOrganizationMember } from '../../hooks/api/queries/useOrganizationMember';
import { MainLoader } from '../MainLoader';
import { useSetSelectedOrganizationWithNavigation } from '../../hooks/useSetSelectedOrganizationWithNavigation';
import { AUTH_APP_BAR_HEIGHT } from '../AppBar/AuthAppBar';

interface AuthenticatedWrapperProps extends PropsWithChildren {
  requireOrgs?: boolean;
}

export const AuthenticatedWrapper = ({ requireOrgs, children }: AuthenticatedWrapperProps) => {
  const { logout } = useLogout();
  const { isLoggedIn, isLoading: isLoadingLoggedIn } = useIsLoggedIn();
  const { data: orgsWithAccess, isLoading: isLoadingOrgs } = useGetAllOrganizationsWithAccess();
  const { isLoading: isLoadingMember } = useOrganizationMember();
  const { setSelectedOrganization } = useSetSelectedOrganizationWithNavigation(false);

  useEffect(() => {
    if (!isLoadingOrgs) {
      // Set org (if available) and navigate to proper page
      setSelectedOrganization();
    }
  }, [isLoadingOrgs, orgsWithAccess, setSelectedOrganization]);

  if (isLoadingLoggedIn || isLoadingOrgs || isLoadingMember) {
    return <MainLoader headerHeight={AUTH_APP_BAR_HEIGHT} />;
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
