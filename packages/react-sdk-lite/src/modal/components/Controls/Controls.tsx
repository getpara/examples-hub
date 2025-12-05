import { CpslIcon } from '@getpara/react-components';
import { safeStyled } from '@getpara/react-common';
import { useModalStore } from '../../stores/index.js';
import { useGoBack } from '../../hooks/useGoBack.js';
import { ChainSelect } from './ChainSelect.js';
import { HeaderButton } from '@getpara/react-common';
import { useStore } from '../../../provider/stores/useStore.js';
import { useStepTitle } from '../Header/hooks/useStepTitle.js';

interface ControlsProps {
  onClose: () => void;
}

export const Controls = ({ onClose }: ControlsProps) => {
  const bareModal = useStore(state => state.modalConfig?.bareModal);
  const hasPreviousStep = useModalStore(state => state.hasPreviousStep());
  const goBack = useGoBack();
  const { isControls } = useStepTitle();

  const handleBackClick = () => {
    goBack();
  };

  return (
    <Container>
      <BackButton
        variant="ghost"
        style={{
          visibility: hasPreviousStep ? 'visible' : 'hidden',
        }}
        onClick={handleBackClick}
        data-testid="modal-back-button"
      >
        <CpslIcon icon="arrow" />
      </BackButton>
      <MiddleContainer>
        {isControls && (
          <>
            <ChainSelect />
          </>
        )}
      </MiddleContainer>
      <CloseButton bareModal={bareModal} variant="ghost" onClick={onClose} data-testid="modal-close-button">
        <CpslIcon icon="close" />
      </CloseButton>
    </Container>
  );
};

const Container = safeStyled.div`
  position: absolute;
  height: 24px;
  top: 0;
  left: -24px;
  right: -24px;
  margin: 0 16px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MiddleContainer = safeStyled.div`
  flex: 1;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const CloseButton = safeStyled(HeaderButton)<{ bareModal?: boolean }>`
  transform: rotate(180deg);
  visibility: ${({ bareModal }) => (bareModal ? 'hidden' : 'visible')};
`;

const BackButton = safeStyled(HeaderButton)`
  transform: rotate(180deg);
  flex-basis: auto;
`;
