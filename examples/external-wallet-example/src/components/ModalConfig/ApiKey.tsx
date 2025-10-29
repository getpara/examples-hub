import { useState } from 'react';
import { useModalStateStore } from '../../stores/modalStateStore/useModalStateStore';
import { CpslButton, CpslCard, CpslInput, CpslText } from '@getpara/react-components';
import styled from 'styled-components';

export const ApiKey = () => {
  const apiKey = useModalStateStore(state => state.apiKey);
  const updateState = useModalStateStore(state => state.updateState);
  const [newKey, setNewKey] = useState();

  const handleSetKey = () => {
    updateState({ apiKey: newKey ?? apiKey });
  };

  return (
    <CpslCard style={{ height: 'fit-content' }}>
      <CpslText variant="headingXS" weight="semiBold">
        API Key
      </CpslText>
      <Container>
        <Input placeholder="API Key" value={newKey ?? apiKey} onCpslInput={e => setNewKey(e.target.value)} />
        <CpslButton onClick={handleSetKey}>Update Key</CpslButton>
      </Container>
    </CpslCard>
  );
};

const Container = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
`;

const Input = styled(CpslInput)`
  flex: 1;
`;
