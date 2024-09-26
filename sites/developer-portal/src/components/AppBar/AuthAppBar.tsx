import { CpslAlert, CpslAppBar, CpslButton, CpslIcon } from '@usecapsule/react-components';
import styled from 'styled-components';
import { DOCS_LINK, MOBILE_SIZE, PlanSlug } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useIsMobile';
import { User } from '../User/User';
import { Dispatch, SetStateAction } from 'react';
import { DocsButton } from '../DocsButton/DocsButton';
import { useAppBanner } from '../../hooks/configs/useAppBanner';
import { EXPANDED_SIDEBAR_WIDTH } from '../../layouts/authenticated/components/NavBar';
import { useNavigate } from 'react-router-dom';
import { GradientCTAButton } from '../GradientCTAButton/GradientCTAButton';
import { useGetSelectedOrganization } from '../../hooks/api/queries/useOrganizations';

export const AUTH_APP_BAR_HEIGHT = 80;

interface AuthAppBarProps {
  setNavOpen: Dispatch<SetStateAction<boolean>>;
}

export const AuthAppBar = ({ setNavOpen }: AuthAppBarProps) => {
  const { data: organization } = useGetSelectedOrganization();
  const isMobile = useIsMobile();
  const { bannerText } = useAppBanner();
  const navigate = useNavigate();

  const handleNavButtonClick = () => {
    setNavOpen(curr => !curr);
  };

  const handleUpgradeClick = () => {
    navigate('/billing');
  };

  return (
    <CpslAppBar height={AUTH_APP_BAR_HEIGHT}>
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

            {organization?.activePlanSlug.toUpperCase() === PlanSlug.FREE && (
              <GradientCTAButton onClick={handleUpgradeClick}>Upgrade</GradientCTAButton>
            )}
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
