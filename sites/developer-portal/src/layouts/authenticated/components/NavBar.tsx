import { CpslDrawer } from '@usecapsule/react-components';
import styled from 'styled-components';
import { Navigation } from './Navigation';
import { User } from '../../../components/User/User';
import { NavBarFooter } from './NavBarFooter';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { APP_BAR_HEIGHT } from './AppBar';
import { MOBILE_SIZE } from '../../../utils/constants';

export const EXPANDED_SIDEBAR_WIDTH = 312;

interface NavBarProps {
  isOpen: boolean;
  closeNav: () => void;
}

export const NavBar = ({ isOpen, closeNav }: NavBarProps) => {
  const isMobile = useIsMobile();

  return (
    <Drawer
      size={isMobile ? 'auto' : EXPANDED_SIDEBAR_WIDTH}
      anchor={isMobile ? 'top' : 'left'}
      open={isMobile ? isOpen : true}
      variant={isMobile ? 'temporary' : 'permanent'}
      anchorPosition={isMobile ? APP_BAR_HEIGHT : 0}
      noOverlay
      zIndexOverride={isMobile ? 9999 : undefined}
    >
      <Container>
        {!isMobile && (
          <UserContainer>
            <User />
          </UserContainer>
        )}
        <Navigation closeNav={closeNav} />
        {!isMobile && <NavBarFooter />}
      </Container>
    </Drawer>
  );
};

const Drawer = styled(CpslDrawer)`
  @media (max-width: ${MOBILE_SIZE}px) {
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.05);
  }
`;

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--cpsl-color-background-0);
  border-right: 1px solid var(--cpsl-color-background-16);
  overflow: auto;

  @media (max-width: ${MOBILE_SIZE}px) {
    padding: 16px 0px;
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    padding: 0px 0px;
  }
`;

const UserContainer = styled.div`
  width: 100%;
  padding: 24px;
`;
