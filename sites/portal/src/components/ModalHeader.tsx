import styled from 'styled-components';
import { CapsuleBlack, ShieldCheck } from './Icons';
import { Text } from './common';
import { useModalOutletContext } from '../hooks/useModalOutletContext';
import { cleanUrl } from '../utils/cleanUrl';

export const ModalHeader = () => {
  const { partner, homepageUrl } = useModalOutletContext();

  return (
    <Container slot="header" id="header">
      <InnerContainer>
        {partner.portalHeaderLogoUrl ? (
          <Logo src={partner.portalHeaderLogoUrl} alt={`${partner.displayName ? `${partner.displayName} -` : ''}logo`} />
        ) : (
          <LogoSvg>
            <CapsuleBlack />
          </LogoSvg>
        )}
      </InnerContainer>
      <InnerContainer>
        <ShieldCheck />
        <URLText>
          <span>{cleanUrl(homepageUrl)}</span>
        </URLText>
      </InnerContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
`;

const InnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

const Logo = styled.img`
  height: 48px;
  max-width: 60%;
  object-fit: contain;
  box-sizing: content-box;
`;

const LogoSvg = styled.div`
  height: 48px;
  align-self: center;

  svg {
    height: 48px;
  }
`;

const URLText = styled(Text)`
  font-weight: 500;
  letter-spacing: 0.48px;
`;
