import { CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';

interface UserIdentifierContainerProps {
  identifier: string;
}

export const UserIdentifier = ({ identifier }: UserIdentifierContainerProps) => {
  return (
    <Container>
      <IdentifierText variant="bodyS" weight="medium">
        {identifier}
      </IdentifierText>
    </Container>
  );
};

const Container = styled.div`
  padding: 8px 16px;
  border-radius: 1000px;
  background-color: var(--cpsl-color-background-4);
`;

const IdentifierText = styled(CpslText)`
  --color-override: var(--cpsl-color-background-96);
`;
