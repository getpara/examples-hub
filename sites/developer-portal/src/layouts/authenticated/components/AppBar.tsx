import { CpslAlert, CpslAppBar, CpslButton, CpslIcon } from '@usecapsule/react-components';
import styled from 'styled-components';
import { EXPANDED_SIDEBAR_WIDTH } from './NavBar';
import { DOCS_LINK, MOBILE_SIZE } from '../../../utils/constants';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { User } from '../../../components/User/User';
import { Dispatch, SetStateAction } from 'react';
import { DocsButton } from '../../../components/DocsButton/DocsButton';
import { useAppBanner } from '../../../hooks/configs/useAppBanner';

export const APP_BAR_HEIGHT = 80;

interface AppBarProps {
  setNavOpen: Dispatch<SetStateAction<boolean>>;
}

export const AppBar = ({ setNavOpen }: AppBarProps) => {
  const isMobile = useIsMobile();
  const { bannerText } = useAppBanner();

  const handleNavButtonClick = () => {
    setNavOpen(curr => !curr);
  };

  return (
    <CpslAppBar height={APP_BAR_HEIGHT}>
      <Container $sidebarWidth={isMobile ? 0 : EXPANDED_SIDEBAR_WIDTH}>
        {isMobile ? (
          <>
            <User />
            <CpslButton variant="ghost" onClick={handleNavButtonClick}>
              <CpslIcon icon="menu" />
            </CpslButton>
          </>
        ) : (
          <>
            <InnerContainer>{bannerText && <CpslAlert variant="warning">{bannerText}</CpslAlert>}</InnerContainer>
            <DocsButton link={DOCS_LINK} />
          </>
        )}
      </Container>
    </CpslAppBar>
  );
};

const Container = styled.div<{ $sidebarWidth: number }>`
  background-color: var(--cpsl-color-background-0);
  margin-left: ${({ $sidebarWidth }) => `${$sidebarWidth}px`};
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  justify-content: space-between;

  @media (max-width: ${MOBILE_SIZE}px) {
    border-bottom: 1px solid var(--cpsl-color-background-16);
    padding: 16px 16px;
  }
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    padding: 16px 24px;
  }
`;

const InnerContainer = styled.div`
  flex: 1;
`;
