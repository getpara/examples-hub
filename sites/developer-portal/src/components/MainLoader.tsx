import { CpslSpinner } from '@getpara/react-components';
import styled from 'styled-components';

interface MainLoaderProps {
  headerHeight: number;
}

export const MainLoader = ({ headerHeight }: MainLoaderProps) => {
  return (
    <Container $headerHeight={headerHeight}>
      <StyledSpinner />
    </Container>
  );
};

const Container = styled.div<{ $headerHeight: number }>`
  width: 100%;
  height: calc(100vh - ${({ $headerHeight }) => `${$headerHeight}px`});
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledSpinner = styled(CpslSpinner)`
  --background-color: var(--cpsl-color-background-4);
`;
