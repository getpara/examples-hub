import { styled } from 'styled-components';
import { CapsuleBlack, CapsuleWhite } from './Icons';
import { useModalOutletContext } from '../hooks/useModalOutletContext';

export const ModalHeader = () => {
  const { partner, isDark } = useModalOutletContext();

  return (
    <Container id="header">
      <InnerContainer>
        {partner.portalHeaderLogoUrl ? (
          <Logo src={partner.portalHeaderLogoUrl} alt={`${partner.displayName ? `${partner.displayName} -` : ''}logo`} />
        ) : (
          <LogoSvg>{isDark ? <CapsuleWhite /> : <CapsuleBlack />}</LogoSvg>
        )}
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
  height: 25px;
  max-width: 60%;
  object-fit: contain;
  box-sizing: content-box;
`;

const LogoSvg = styled.div`
  height: 25px;
  align-self: center;

  svg {
    height: 25px;
  }
`;
