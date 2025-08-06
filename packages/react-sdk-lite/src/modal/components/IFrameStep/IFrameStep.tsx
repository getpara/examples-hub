import { useEffect, useState } from 'react';
import { useModalStore } from '../../stores/index.js';
import { IFrameSteps } from '../../utils/steps.js';
import { safeStyled } from '@getpara/react-common';
import { SpinnerContainer } from '@getpara/react-common';
import { CpslSpinner } from '@getpara/react-components';
import { getPortalBaseURL } from '@getpara/web-sdk';
import { MOBILE_SIZE } from '../../constants/constants.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

export const IFrameStep = () => {
  const iFrameUrl = useModalStore(state => state.iFrameUrl);
  const setIsReady = useModalStore(state => state.setIsIFrameReady);
  const isReady = useModalStore(state => state.isIFrameReady);
  const currentStep = useModalStore(state => state.step);
  const embeddedModal = useStore(state => state.modalConfig?.embeddedModal);
  const para = useInternalClient();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!IFrameSteps.includes(currentStep)) {
      setHeight(0);
    }
  }, [currentStep]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!iFrameUrl) {
        return; // No iFrame URL to check against
      }

      const portalBase = getPortalBaseURL(para.ctx);

      if (!event.origin.startsWith(portalBase)) {
        return; // Ignore messages from untrusted origins
      }

      if (event.data) {
        if (event.data.type === 'HEIGHT') {
          setHeight(event.data.height);
          setIsReady(true);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setIsReady, iFrameUrl]);

  return (
    <OuterContainer $isVisible={IFrameSteps.includes(currentStep)} $embeddedModal={!!embeddedModal} $isReady={!!isReady}>
      <Container $isReady={!!isReady} $height={height}>
        <iframe src={iFrameUrl} />
      </Container>
      {!isReady && (
        <SpinnerContainer style={{ width: '100%', height: '100%', flex: 1, position: 'absolute' }}>
          <CpslSpinner size={100} />
        </SpinnerContainer>
      )}
    </OuterContainer>
  );
};

const OuterContainer = safeStyled.div<{ $isVisible: boolean; $embeddedModal: boolean; $isReady: boolean }>`
  position: relative;
  height: ${({ $isVisible, $isReady }) => ($isVisible ? ($isReady ? 'auto' : '200px') : '0px')};
  width: ${({ $isVisible }) => ($isVisible ? '100%' : '0px')};
  flex: ${({ $isVisible }) => ($isVisible ? 1 : 'auto')};
  padding: 0px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${MOBILE_SIZE}px) {
    padding: ${({ $embeddedModal, $isVisible }) =>
      !$isVisible ? '0px' : $embeddedModal ? '12px 0px 0px' : '72px 16px 0px'};
  }
`;

const Container = safeStyled.div<{ $isReady: boolean; $height: number }>`
  height: ${({ $height }) => $height}px;
  width: 100%;
  opacity: ${({ $isReady }) => ($isReady ? 1 : 0)};

  & > iframe {
    height: ${({ $height }) => $height}px;
    width: 100%;
    border: none;
    background: transparent;
  }
`;
