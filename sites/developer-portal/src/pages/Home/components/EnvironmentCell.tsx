import { CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { Environment } from '../../../types/environment';
import { formatEnvName, getKeyColor } from '../../../utils/apiKey';

interface EnvironmentCellProps {
  environment: Environment;
}

export const EnvironmentCell = ({ environment }: EnvironmentCellProps) => {
  return (
    <Container>
      <Icon $environment={environment} />
      <Label variant="bodyS">{formatEnvName(environment)}</Label>
    </Container>
  );
};

const Container = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled(CpslText)`
  text-transform: capitalize;
`;

const Icon = styled.span<{ $environment: Environment }>`
  width: 8px;
  height: 8px;
  border-radius: 8px;

  background-color: ${({ $environment }) => getKeyColor($environment)};
`;
