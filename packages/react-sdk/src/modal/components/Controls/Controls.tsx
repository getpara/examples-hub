import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import { styled } from 'styled-components';
import { useModalStore } from '../../stores/index.js';
import { useThemeStore } from '../../stores/theme/useThemeStore.js';
import { useGoBack } from '../../hooks/useGoBack.js';
import { AccountSelect, ChainSelect } from './Selects.js';
import { ModalStep } from '../../utils/steps.js';

interface ControlsProps {
  onClose: () => void;
}

export const Controls = ({ onClose }: ControlsProps) => {
  const bareModal = useThemeStore(state => state.bareModal);
  const hasPreviousStep = useModalStore(state => state.hasPreviousStep());
  const step = useModalStore(state => state.step);
  const isFullyLoggedIn = useModalStore(state => state.isFullyLoggedIn);
  const goBack = useGoBack();

  const isAccountStep = step === ModalStep.ACCOUNT_MAIN;
  const isChainSwitchStep = step === ModalStep.CHAIN_SWITCH;
  const shouldShowSelects = isAccountStep || isChainSwitchStep;

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
      >
        <CpslIcon icon="arrow" />
      </BackButton>
      <MiddleContainer>
        {shouldShowSelects && isFullyLoggedIn && (
          <>
            <ChainSelect />
            <AccountSelect />
          </>
        )}
      </MiddleContainer>
      <CloseButton bareModal={bareModal} variant="ghost" onClick={onClose}>
        <CpslIcon icon="close" />
      </CloseButton>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  width: 100%;
  top: 16px;

  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const MiddleContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`;

const StyledButton = styled(CpslButton)`
  flex: 0;
  --button-padding-top: 2px;
  --button-padding-bottom: 2px;
  --button-padding-start: 2px;
  --button-padding-end: 2px;
  --button-border-radius: 1000px;
  --button-background-color: var(--cpsl-color-background-4);

  cpsl-icon {
    --height: 20px;
    --width: 20px;
  }
`;

const CloseButton = styled(StyledButton)<{ bareModal?: boolean }>`
  transform: rotate(180deg);
  visibility: ${({ bareModal }) => (bareModal ? 'hidden' : 'visible')};
`;

const BackButton = styled(StyledButton)`
  transform: rotate(180deg);
`;
