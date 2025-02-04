import { styled } from 'styled-components';
import { useModalOutletContext } from '../hooks/useModalOutletContext';
import { CpslIcon } from '@getpara/react-components';

export const ModalHeader = () => {
  const { partner, isDark } = useModalOutletContext();

  return (
    <Container id="header">
      <InnerContainer>
        {partner.portalHeaderLogoUrl ? (
          <Logo src={partner.portalHeaderLogoUrl} alt={`${partner.displayName ? `${partner.displayName} -` : ''}logo`} />
        ) : (
          <ParaLogo icon="para" $isDark={isDark} />
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

const ParaLogo = styled(CpslIcon)<{ $isDark: boolean }>`
  --height: 25px;
  --width: auto;

  --icon-color: ${({ $isDark }) => ($isDark ? 'white' : 'black')};
`;
