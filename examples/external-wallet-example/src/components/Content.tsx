import { useModal, useAccount } from '@getpara/react-sdk';
import { SolanaProfile } from './SolanaProfile';
import { CpslButton } from '@getpara/react-components';
import styled from 'styled-components';
import { EvmProfile } from './EvmProfile';
import { CosmosProfile } from './CosmosProfile';
import { ModalConfig } from './ModalConfig/ModalConfig';
import { ParaProfile } from './ParaProfile';

export const Content = () => {
  const { openModal } = useModal();
  const { data: account } = useAccount();

  return (
    <Container>
      <ConfigContainer>
        <ModalConfig />
      </ConfigContainer>
      <InnerContainer>
        <ParaProfile />
        <EvmProfile />
        <CosmosProfile />
        <SolanaProfile />
        <CpslButton onClick={openModal}>{!!account ? 'Open Modal' : 'Login'}</CpslButton>
      </InnerContainer>
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--cpsl-color-background-16);
  padding: 16px;
  word-wrap: break-word;
`;

const InnerContainer = styled.div`
  flex: 1;
  gap: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 90vw;
`;

const ConfigContainer = styled.div`
  flex: 1;
  padding: 8px;
  width: 100%;
`;
