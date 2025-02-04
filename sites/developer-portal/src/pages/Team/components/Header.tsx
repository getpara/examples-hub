import { CpslText } from '@getpara/react-components';
import styled from 'styled-components';

export const Header = () => {
  return (
    <Container>
      <CpslText variant="bodyL" weight="semiBold">
        Members
      </CpslText>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
