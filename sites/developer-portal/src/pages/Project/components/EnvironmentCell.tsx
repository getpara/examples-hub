import { CpslIcon, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { Environment } from '../../../types/environment';
import { formatEnvName, getKeyColor } from '../../../utils/apiKey';

interface EnvironmentCellProps {
  environment: Environment;
  archiveIndex?: number;
}

export const EnvironmentCell = ({ environment, archiveIndex }: EnvironmentCellProps) => {
  return (
    <Container>
      <Icon $environment={environment} />
      <Label variant="bodyS">{formatEnvName(environment)}</Label>
      {!!archiveIndex && (
        <ArchiveLabel>
          <ArchiveIcon icon="star04Filled" />
          <CpslText variant="body2XS" weight="medium" color="inverted">
            Archive
          </CpslText>
        </ArchiveLabel>
      )}
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

const ArchiveLabel = styled.div`
  padding: 2px 4px;
  background-color: var(--cpsl-color-foreground-32);
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
`;

const ArchiveIcon = styled(CpslIcon)`
  --height: 10px;
  --width: 10px;
  --icon-color: var(--cpsl-color-text-inverted);
`;
