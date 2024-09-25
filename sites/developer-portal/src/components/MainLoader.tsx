import { CpslSpinner } from '@usecapsule/react-components';
import styled from 'styled-components';

export const MainLoader = () => {
  return (
    <Container>
      <StyledSpinner />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledSpinner = styled(CpslSpinner)`
  --background-color: var(--cpsl-color-background-4);
`;
