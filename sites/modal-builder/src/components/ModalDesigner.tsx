import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import '@getpara/react-sdk/styles.css';
import {
  AppearanceConfigurator,
  AuthenticationConfigurator,
  DepositCryptoConfigurator,
  GuestLoginConfigurator,
  // NetworksConfigurator,
  OffRampsConfigurator,
  OnRampsConfigurator,
  SecurityConfigurator,
  WalletsConfigurator,
} from './Configuration';
import { Accordion, AnnouncementBanner, AccountActionButtons, MoreQuestions, Text, ErrorFallback } from './UI';
import { CodePreviewDisplay, ModalPreviewDisplay, PreviewControls } from './Preview';
import { useAtom } from 'jotai';
import { viewAtom } from '../atoms';
import { NavBar } from './UI/Nav';
import { CpslIcon } from '@getpara/react-components';
import { ErrorBoundary } from 'react-error-boundary';
import { useAccount } from '@getpara/react-sdk';

export const ModalDesigner: React.FC = () => {
  const [view] = useAtom(viewAtom);
  const [isMobileOverlayVisible, setIsMobileOverlayVisible] = useState(false);

  const { isConnected } = useAccount();

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      setIsMobileOverlayVisible(isMobile);
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCloseOverlay = () => {
    setIsMobileOverlayVisible(false);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ModalDesignerWrapper>
        {isMobileOverlayVisible && (
          <MobileOverlay>
            <CloseIcon onClick={handleCloseOverlay}>
              <CpslIcon icon="close" />
            </CloseIcon>
            <OverlayContent>
              <CpslIcon icon="monitor" />
              <Text variant="bodyM" weight="semiBold" color="inverted">
                Please use a desktop or laptop for best experience
              </Text>
            </OverlayContent>
          </MobileOverlay>
        )}
        <NavBar />
        <ModalDesignerLayout>
          <ConfigurationPanel>
            <ConfigurationContent>
              <AnnouncementBanner />
              <Accordion defaultActive="appearance">
                <AppearanceConfigurator />
                {/* <NetworksConfigurator /> */}
                <WalletsConfigurator />
                <AuthenticationConfigurator />
                <GuestLoginConfigurator />
                <SecurityConfigurator />
                <OnRampsConfigurator />
                <OffRampsConfigurator />
                <DepositCryptoConfigurator />
              </Accordion>
              <MoreQuestions />
            </ConfigurationContent>
          </ConfigurationPanel>
          <PreviewPanel>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <PreviewControlsRow>
                <PreviewControls />
                {isConnected && (
                  <FadeInWrapper>
                    <AccountActionButtons />
                  </FadeInWrapper>
                )}
              </PreviewControlsRow>
              <PreviewContent>
                {view === 'desktop' || view === 'mobile' ? <ModalPreviewDisplay /> : <CodePreviewDisplay />}
              </PreviewContent>
            </ErrorBoundary>
          </PreviewPanel>
        </ModalDesignerLayout>
      </ModalDesignerWrapper>
    </ErrorBoundary>
  );
};

const ModalDesignerWrapper = styled.div`
  position: relative;
  background-color: #f5f5f5;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
const ModalDesignerLayout = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  width: 100%;
  height: 100%;
  padding: 1rem 0px 0px;
  position: relative;
  z-index: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
const ConfigurationPanel = styled.div`
  height: 100%;
  overflow-y: scroll;
  scrollbar-gutter: stable;
  min-width: 460px;
  padding: 0 1rem;
`;
const ConfigurationContent = styled.div`
  gap: 0.5rem;
  display: flex;
  flex-direction: column;
  width: 428px;

  cpsl-accordion-item {
    margin-bottom: 0.5rem;
  }
`;

const PreviewPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 1rem;
  gap: 1rem;
  flex-grow: 1;
`;
const PreviewContent = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
`;
const PreviewControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  z-index: 2;
`;
const fadeIn = keyframes`  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }`;
const FadeInWrapper = styled.div`
  opacity: 0;
  animation: ${fadeIn} 0.3s ease-in-out forwards;
`;
const MobileOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;
const CloseIcon = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;
  cpsl-icon {
    --width: 24px;
    --height: 24px;
    --icon-color: white;
  }
`;
const OverlayContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  text-align: center;
  max-width: 256px;
  gap: 1rem;

  cpsl-icon {
    --width: 32px;
    --height: 32x;
    --icon-color: white;
  }
`;
