import { CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';

export const Header = () => {
  return (
    <Container>
      <CpslText variant="bodyL" weight="semiBold">
        Early Access
      </CpslText>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
