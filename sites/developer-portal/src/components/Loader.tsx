import { CpslSpinner } from '@usecapsule/react-components';
import styled from 'styled-components';

export const Loader = () => {
  return (
    <Container>
      <CpslSpinner />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
