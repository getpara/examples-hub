import { FallbackProps } from 'react-error-boundary';
import styled from 'styled-components';
import { Text } from './StyledText';
import { Button } from './StyledButton';

export const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <ErrorContainer>
      <Text variant="bodyM" weight="semiBold" color="secondary">
        Something went wrong:
      </Text>
      <pre>{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Refresh</Button>
    </ErrorContainer>
  );
};

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
