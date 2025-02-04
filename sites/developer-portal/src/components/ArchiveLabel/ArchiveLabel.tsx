import { CpslIcon, CpslText } from '@getpara/react-components';
import styled from 'styled-components';

export const ArchiveLabel = () => {
  return (
    <Container>
      <ArchiveIcon icon="cube03" />
      <CpslText variant="body2XS" weight="medium" color="inverted">
        Archive
      </CpslText>
    </Container>
  );
};

const Container = styled.div`
  padding: 2px 4px;
  background-color: var(--cpsl-color-foreground-32);
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  max-width: fit-content;
`;

const ArchiveIcon = styled(CpslIcon)`
  --height: 10px;
  --width: 10px;
  --icon-color: var(--cpsl-color-text-inverted);
`;
