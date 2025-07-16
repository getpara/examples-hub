import { CpslIcon } from '@getpara/react-components';
import { safeStyled } from '@getpara/react-common';
import { useModalStore } from '../../stores/index.js';
import { useGoBack } from '../../hooks/useGoBack.js';
import { AccountSelect, ChainSelect } from './Selects.js';
import { ModalStep } from '../../utils/steps.js';
import { HeaderButton } from '@getpara/react-common';
import { useStore } from '../../../provider/stores/useStore.js';
import { useAccount } from '../../../provider/index.js';

interface ControlsProps {
  onClose: () => void;
}

export const Controls = ({ onClose }: ControlsProps) => {
  const bareModal = useStore(state => state.modalConfig?.bareModal);
  const hasPreviousStep = useModalStore(state => state.hasPreviousStep());
  const step = useModalStore(state => state.step);
  const goBack = useGoBack();
  const { isConnected } = useAccount();

  const shouldShowSelects = [
    ModalStep.ACCOUNT_MAIN,
    ModalStep.CHAIN_SWITCH,
    ModalStep.ADD_FUNDS_BUY,
    ModalStep.ADD_FUNDS_RECEIVE,
    ModalStep.ADD_FUNDS_WITHDRAW,
  ].includes(step);

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
        {shouldShowSelects && isConnected && (
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

const Container = safeStyled.div`
  position: absolute;
  width: 100%;
  top: 16px;

  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const MiddleContainer = safeStyled.div`
  flex: 1;
  display: flex;
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
`;
