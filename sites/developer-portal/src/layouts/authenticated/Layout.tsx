import { NavBar, EXPANDED_SIDEBAR_WIDTH } from './components/NavBar';
import { Outlet, useNavigate } from 'react-router-dom';
import { APP_BAR_HEIGHT, AppBar } from './components/AppBar';
import styled from 'styled-components';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useEffect, useState } from 'react';
import { MOBILE_SIZE } from '../../utils/constants';
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn';
import { useGetAllOrganizationsWithAccess, useGetOrganizationAccess } from '../../hooks/api/queries/useOrganizations';
import { useLogout } from '../../hooks/useLogout';
import { useAppStore } from '../../stores/app/useAppStore';
import { MainLoader } from '../../components/MainLoader';

export const Layout = () => {
  const { logout } = useLogout();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const { isLoggedIn, isLoading: isLoadingLoggedIn } = useIsLoggedIn();
  const { data: access, isLoading: isLoadingOrgs } = useGetOrganizationAccess();
  const { data: orgsWithAccess } = useGetAllOrganizationsWithAccess();
  const setSelectedOrganization = useAppStore(state => state.setSelectedOrganization);

  useEffect(() => {
    if (!isLoadingOrgs && !access?.hasAccess) {
      if (!orgsWithAccess?.length) {
        navigate('/login/request-access', { replace: true });
      } else {
        setSelectedOrganization(orgsWithAccess[0]!.id);
        navigate('/', { replace: true });
      }
    }
  }, [access?.hasAccess, isLoadingOrgs, isLoggedIn, navigate, orgsWithAccess]);

  const closeNav = () => {
    setIsNavExpanded(false);
  };

  if (isLoadingLoggedIn || isLoadingOrgs) {
    return <MainLoader />;
  }

  if (!isLoggedIn) {
    logout();
    return null;
  }

  if (!access?.hasAccess) {
    return null;
  }

  return (
    <>
      <AppBar setNavOpen={setIsNavExpanded} />
      <NavBar isOpen={isNavExpanded} closeNav={closeNav} />
      <Main $sidebarWidth={isMobile ? 0 : EXPANDED_SIDEBAR_WIDTH}>
        <div>
          <InnerContainer>
            <Outlet />
          </InnerContainer>
        </div>
      </Main>
    </>
  );
};

const Main = styled.main<{ $sidebarWidth: number }>`
  overflow: auto;
  margin-left: ${({ $sidebarWidth }) => `${$sidebarWidth}px`};

  @media (max-width: ${MOBILE_SIZE}px) {
    height: calc(100vh - ${APP_BAR_HEIGHT}px);
    padding: 0px;
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    max-height: calc(100vh - ${APP_BAR_HEIGHT}px);
    padding: 0px 24px;
  }
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px 0px;

  @media (max-width: ${MOBILE_SIZE}px) {
    gap: 16px;
    padding: 16px;
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    gap: 24px;
  }
`;
