import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import styled from 'styled-components';
import { LANDING_HEADER_LINKS } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const LANDING_APP_BAR_HEIGHT = 80;

export const LandingAppBar = () => {
  const isMobile = useIsMobile();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const handleMenuClick = () => {
    setIsMenuOpen(curr => !curr);
  };

  return (
    <Container>
      <InnerContainer>
        <ContentContainer>
          <Logo icon="para" />
          {isMobile ? (
            <>
              <CpslIcon icon="menu" onClick={handleMenuClick} />
            </>
          ) : (
            <LinksContainer>
              {LANDING_HEADER_LINKS.map(({ label, url }) => (
                <LinkButton href={url} variant="ghost" as="a" target="_blank">
                  <CpslText variant="bodyS" weight="medium">
                    {label}
                  </CpslText>
                </LinkButton>
              ))}
            </LinksContainer>
          )}
        </ContentContainer>
        <AnimatePresence>
          {isMobile && isMenuOpen && (
            <MobileLinksContainer
              style={{ overflow: 'hidden' }}
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              transition={{ duration: 0.15 }}
              exit={{ height: 0 }}
              key={'container'}
            >
              {LANDING_HEADER_LINKS.map(({ label, url }) => (
                <MobileLinkButton href={url} variant="ghost" as="a" target="_blank">
                  <CpslText variant="bodyS" weight="medium">
                    {label}
                  </CpslText>
                </MobileLinkButton>
              ))}
            </MobileLinksContainer>
          )}
        </AnimatePresence>
      </InnerContainer>
    </Container>
  );
};

const Container = styled.div`
  padding: 16px 16px 0px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0px;
  width: 100vw;
  z-index: 10;
  height: auto;
`;

const InnerContainer = styled.div`
  border: 1px solid;
  border-color: var(--cpsl-color-background-8);
  border-radius: 16px;
  background-color: var(--cpsl-color-background-0);
  width: 100%;
  height: auto;
  padding: 20px 24px;
  max-width: 1183px;
`;

const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
  justify-content: space-between;
`;

const LinksContainer = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
`;

const MobileLinksContainer = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Logo = styled(CpslIcon)`
  --height: 24px;
  --width: auto;
`;

const LinkButton = styled(CpslButton)`
  --button-ghost-color: var(--cpsl-color-text-primary);
  --button-ghost-hover-color: var(--cpsl-color-text-primary);
`;

const MobileLinkButton = styled(LinkButton)`
  padding-top: 24px;
`;
