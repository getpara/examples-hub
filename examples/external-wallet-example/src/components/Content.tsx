import { useEffect, useState } from 'react';
import capsule from '../clients/capsule';
import { CapsuleModal, EnabledFlow, Network, OnRampAsset, OnRampProvider } from '@usecapsule/react-sdk';
import { SolanaProfile } from './SolanaProfile';
import { CpslButton } from '@usecapsule/react-components';
import styled from 'styled-components';
import { EvmProfile } from './EvmProfile';
import { CosmosProfile } from './CosmosProfile';
import { ModalConfig } from './ModalConfig/ModalConfig';
import { useModalStateStore } from '../stores/modalStateStore/useModalStateStore';

const DEFAULT_RAMP_HOST_API_KEY = '7t45dxm7yhho7fr9u4b9k8nv9gvczansfu8zt9pm';

export const Content = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const oAuthMethods = useModalStateStore(state => state.oAuthMethods);
  const externalWallets = useModalStateStore(state => state.externalWallets);
  const authLayout = useModalStateStore(state => state.authLayout);
  const backgroundColor = useModalStateStore(state => state.backgroundColor);
  const foregroundColor = useModalStateStore(state => state.foregroundColor);
  const accentColor = useModalStateStore(state => state.accentColor);
  const mode = useModalStateStore(state => state.mode);
  const logo = useModalStateStore(state => state.logo);

  const checkIsLoggedIn = async () => {
    const isLoggedIn = await capsule.isFullyLoggedIn();
    setIsLoggedIn(isLoggedIn);
  };

  useEffect(() => {
    checkIsLoggedIn();
  }, []);

  const handleModalButtonClick = () => {
    setIsModalOpen(true);
  };

  const onModalClose = () => {
    setIsModalOpen(false);
    checkIsLoggedIn();
  };

  return (
    <Container>
      <ConfigContainer>
        <ModalConfig />
      </ConfigContainer>
      <InnerContainer>
        <EvmProfile />
        <CosmosProfile />
        <SolanaProfile />
        <CpslButton onClick={handleModalButtonClick}>{isLoggedIn ? 'Open Modal' : 'Login'}</CpslButton>
      </InnerContainer>
      <CapsuleModal
        capsule={capsule}
        isOpen={isModalOpen}
        onClose={onModalClose}
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
        appName="Capsule External Wallet Example"
        onRampConfig={{
          testMode: true,
          network: Network.ETHEREUM,
          asset: OnRampAsset.ETHEREUM,
          providers: [{ id: OnRampProvider.STRIPE }, { id: OnRampProvider.RAMP, hostApiKey: DEFAULT_RAMP_HOST_API_KEY }],
          enabledFlows: [EnabledFlow.BUY, EnabledFlow.RECEIVE],
        }}
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
