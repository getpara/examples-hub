import { ParaModal, useModal, useAccount } from '@getpara/react-sdk';
import { SolanaProfile } from './SolanaProfile';
import { CpslButton } from '@getpara/react-components';
import styled from 'styled-components';
import { EvmProfile } from './EvmProfile';
import { CosmosProfile } from './CosmosProfile';
import { ModalConfig } from './ModalConfig/ModalConfig';
import { useModalStateStore } from '../stores/modalStateStore/useModalStateStore';
import { ParaProfile } from './ParaProfile';

export const Content = () => {
  const oAuthMethods = useModalStateStore(state => state.oAuthMethods);
  const externalWallets = useModalStateStore(state => state.externalWallets);
  const authLayout = useModalStateStore(state => state.authLayout);
  const backgroundColor = useModalStateStore(state => state.backgroundColor);
  const foregroundColor = useModalStateStore(state => state.foregroundColor);
  const accentColor = useModalStateStore(state => state.accentColor);
  const mode = useModalStateStore(state => state.mode);
  const logo = useModalStateStore(state => state.logo);
  const { openModal } = useModal();
  const { data: account } = useAccount();

  const handleModalButtonClick = () => {
    openModal();
  };

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
        <CpslButton onClick={handleModalButtonClick}>{!!account ? 'Open Modal' : 'Login'}</CpslButton>
      </InnerContainer>
      <ParaModal
        oAuthMethods={oAuthMethods}
        externalWallets={externalWallets}
        authLayout={authLayout}
        theme={{
          mode,
          foregroundColor,
          backgroundColor,
          accentColor,
        }}
        logo={logo}
        appName="Para External Wallet Example"
        onRampTestMode={true}
      />
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
