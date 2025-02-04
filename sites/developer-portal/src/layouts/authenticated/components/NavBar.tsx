import { CpslButton, CpslDrawer, CpslIcon, CpslText } from '@getpara/react-components';
import styled from 'styled-components';
import { Navigation } from './Navigation';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { MOBILE_SIZE } from '../../../utils/constants';
import { useLogout } from '../../../hooks/useLogout';
import { useOrganizationMember } from '../../../hooks/api/queries/useOrganizationMember';
import { Organizations } from './Organizations';
import { AUTH_APP_BAR_HEIGHT } from '../../../components/AppBar/AuthAppBar';
import { AccountWarning } from './AccountWarning';
import { PlanUsage } from './PlanUsage';

export const EXPANDED_SIDEBAR_WIDTH = 312;

interface NavBarProps {
  isOpen: boolean;
  closeNav: () => void;
}

export const NavBar = ({ isOpen, closeNav }: NavBarProps) => {
  const isMobile = useIsMobile();
  const { logout } = useLogout();
  const { data: orgMember } = useOrganizationMember();

  const userName = orgMember?.user?.name ?? orgMember?.user?.email ?? '';

  return (
    <Drawer
      size={isMobile ? 'auto' : EXPANDED_SIDEBAR_WIDTH}
      anchor={isMobile ? 'top' : 'left'}
      open={isMobile ? isOpen : true}
      variant={isMobile ? 'temporary' : 'permanent'}
      anchorPosition={isMobile ? AUTH_APP_BAR_HEIGHT : 0}
      noOverlay
      zIndexOverride={isMobile ? 9999 : undefined}
    >
      <Container>
        <Organizations />
        <Navigation closeNav={closeNav} />
        <BottomContainer>
          <AccountWarning />
          <Username variant="bodyS" weight="medium">
            {userName}
          </Username>
          <CpslButton size="small" fullWidth variant="secondary" onClick={logout}>
            Log Out
            <CpslIcon icon="logOut" />
          </CpslButton>
          <PlanUsage />
        </BottomContainer>
      </Container>
    </Drawer>
  );
};

const Drawer = styled(CpslDrawer)`
  @media (max-width: ${MOBILE_SIZE}px) {
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.05);
  }
`;

const Username = styled(CpslText)`
  width: 100%;
  padding: 16px 0px;

  &::part(text-element) {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const BottomContainer = styled.div`
  width: 100%;
  padding: 0px 16px;
  padding-bottom: 16px;
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
