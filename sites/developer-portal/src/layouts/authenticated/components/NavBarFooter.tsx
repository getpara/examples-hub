import { CpslIcon, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';

export const NavBarFooter = () => {
  return (
    <Container>
      <Logo icon="capsuleLogo" />
      <CpslText color="tertiary">Developer Portal</CpslText>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 32px 24px;
`;

const Logo = styled(CpslIcon)`
  --height: 24px;
  --width: 88px;
`;
