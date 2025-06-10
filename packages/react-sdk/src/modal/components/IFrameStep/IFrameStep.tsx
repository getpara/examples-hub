import { useModalStore } from '../../stores/index.js';
import { IFrameSteps } from '../../utils/steps.js';
import { safeStyled } from '@getpara/react-common';
import { SpinnerContainer } from '@getpara/react-common';
import { CpslSpinner } from '@getpara/react-components';
import { MOBILE_SIZE } from '../../constants/constants.js';
import { useStore } from '../../../provider/stores/useStore.js';

export const IFrameStep = () => {
  const iFrameUrl = useModalStore(state => state.iFrameUrl);
  const setIsReady = useModalStore(state => state.setIsIFrameReady);
  const isReady = useModalStore(state => state.isIFrameReady);
  const currentStep = useModalStore(state => state.step);
  const embeddedModal = useStore(state => state.modalConfig?.embeddedModal);

  return (
    <OuterContainer $isVisible={IFrameSteps.includes(currentStep)} $embeddedModal={!!embeddedModal}>
      <Container $isReady={!!isReady}>
        <iframe
          src={iFrameUrl}
          onLoad={() => {
            setIsReady(true);
          }}
        />
      </Container>
      {!isReady && (
        <SpinnerContainer style={{ width: '100%', height: '100%', flex: 1 }}>
          <CpslSpinner size={100} />
        </SpinnerContainer>
      )}
    </OuterContainer>
  );
};

const OuterContainer = safeStyled.div<{ $isVisible: boolean; $embeddedModal: boolean }>`
  height: ${({ $isVisible }) => ($isVisible ? '100%' : '0px')};
  width: ${({ $isVisible }) => ($isVisible ? '100%' : '0px')};
  flex: ${({ $isVisible }) => ($isVisible ? 1 : 'auto')};
  padding: ${({ $embeddedModal, $isVisible }) => (!$isVisible ? '0px' : $embeddedModal ? '12px 0px 0px' : '72px 72px 32px')};
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: ${MOBILE_SIZE}px) {
    padding: ${({ $embeddedModal, $isVisible }) =>
      !$isVisible ? '0px' : $embeddedModal ? '12px 0px 0px' : '72px 16px 0px'};
  }
`;

const Container = safeStyled.div<{ $isReady: boolean }>`
  height: 100%;
  width: 100%;
  display: ${({ $isReady }) => ($isReady ? 'block' : 'none')};

  & > iframe {
    height: 360px;
    width: 100%;
    border: none;
  }
`;
