import styled from 'styled-components';
import { CopyTo } from './CopyTo';
import { Save } from './Save';

export const ConfigurationActions = () => {
  return (
    <Container>
      <CopyTo />
      <Save />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-self: flex-end;
  gap: 8px;
`;
