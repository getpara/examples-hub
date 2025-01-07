import { CpslAppBar, CpslButton, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { CapsuleBlack } from '../Icons';
import { LANDING_HEADER_LINKS } from '../../utils/constants';

export const LANDING_APP_BAR_HEIGHT = 80;

export const LandingAppBar = () => {
  return (
    <Container>
      <StyledAppBar height={LANDING_APP_BAR_HEIGHT - 16}>
        <ContentContainer>
          <LogoContainer>
            <CapsuleBlack />
          </LogoContainer>
          <LinksContainer>
            {LANDING_HEADER_LINKS.map(({ label, url }) => (
              <LinkButton href={url} variant="ghost" as="a" target="_blank">
                <CpslText variant="bodyS" weight="medium">
                  {label}
                </CpslText>
              </LinkButton>
            ))}
          </LinksContainer>
        </ContentContainer>
      </StyledAppBar>
    </Container>
  );
};

const Container = styled.div`
  height: ${LANDING_APP_BAR_HEIGHT}px;
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0px;
  width: 100vw;
  z-index: 10;
`;

const StyledAppBar = styled(CpslAppBar)`
  border: 1px solid;
  border-color: var(--cpsl-color-background-8);
  border-radius: 16px;
  background-color: var(--cpsl-color-background-0);

  &::part(container) {
    max-width: 1183px;
  }
  max-width: 1183px;
`;

const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  justify-content: space-between;
  padding-left: 24px;
  padding-right: 24px;
`;

const LinksContainer = styled.div`
  display: flex;
  gap: 24px;
`;

const LogoContainer = styled.div`
  width: 94px;
  height: 100%;
  display: flex;
  svg {
    width: 94px;
  }
`;

const LinkButton = styled(CpslButton)`
  --button-ghost-color: var(--cpsl-color-text-primary);
  --button-ghost-hover-color: var(--cpsl-color-text-primary);
`;
