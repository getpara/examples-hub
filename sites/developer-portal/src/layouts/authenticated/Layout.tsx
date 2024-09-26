import { NavBar, EXPANDED_SIDEBAR_WIDTH } from './components/NavBar';
import { Outlet } from 'react-router-dom';
import { AUTH_APP_BAR_HEIGHT, AuthAppBar } from '../../components/AppBar/AuthAppBar';
import styled from 'styled-components';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useState } from 'react';
import { MOBILE_SIZE } from '../../utils/constants';
import { AuthenticatedWrapper } from '../../components/AuthenticatedWrapper/AuthenticatedWrapper';

export const Layout = () => {
  const isMobile = useIsMobile();
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const closeNav = () => {
    setIsNavExpanded(false);
  };

  return (
    <AuthenticatedWrapper requireOrgs>
      <AuthAppBar setNavOpen={setIsNavExpanded} />
      <NavBar isOpen={isNavExpanded} closeNav={closeNav} />
      <Main $sidebarWidth={isMobile ? 0 : EXPANDED_SIDEBAR_WIDTH}>
        <div>
          <InnerContainer>
            <Outlet />
          </InnerContainer>
        </div>
      </Main>
    </AuthenticatedWrapper>
  );
};

const Main = styled.main<{ $sidebarWidth: number }>`
  overflow: auto;
  margin-left: ${({ $sidebarWidth }) => `${$sidebarWidth}px`};
  background-color: var(--cpsl-color-background-4);

  @media (max-width: ${MOBILE_SIZE}px) {
    height: calc(100vh - ${AUTH_APP_BAR_HEIGHT}px);
    padding: 0px;
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    height: calc(100vh - ${AUTH_APP_BAR_HEIGHT}px);
    max-height: calc(100vh - ${AUTH_APP_BAR_HEIGHT}px);
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
