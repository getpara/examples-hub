import { useModal } from '@getpara/react-sdk';
import { CpslButton, CpslText } from '@getpara/react-components';
import styled from 'styled-components';
import { useEffect, useState } from 'react';

// Import ModalStep from the react-sdk
import { ModalStep, useAccount } from '@getpara/react-sdk';

export const ModalStepSelector = () => {
  const { isConnected } = useAccount();
  const { openModal } = useModal();
  const [selectedStep, setSelectedStep] = useState<ModalStep>(isConnected ? ModalStep.ACCOUNT_MAIN : ModalStep.AUTH_MAIN);

  const handleOpenModal = () => {
    openModal({ step: selectedStep });
  };

  // Get all available modal steps
  const modalSteps = Object.values(ModalStep);

  useEffect(() => {
    setSelectedStep(isConnected ? ModalStep.ACCOUNT_MAIN : ModalStep.AUTH_MAIN);
  }, [isConnected]);

  return (
    <Container>
      <CpslText variant="bodyM" weight="medium" color="primary">
        Open Modal to Specific Step
      </CpslText>

      <StepSelectorContainer>
        <CpslText variant="bodyS" color="secondary">
          Select Modal Step:
        </CpslText>

        <Select value={selectedStep} onChange={e => setSelectedStep(e.target.value as ModalStep)}>
          {modalSteps.map(step => (
            <option key={step} value={step}>
              {step}
            </option>
          ))}
        </Select>

        <CpslButton onClick={handleOpenModal} size="small">
          Open Modal to {selectedStep}
        </CpslButton>
      </StepSelectorContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--cpsl-color-border-12);
  border-radius: 8px;
  background: var(--cpsl-color-background-8);
  min-width: 300px;
`;

const StepSelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid var(--cpsl-color-border-12);
  border-radius: 4px;
  background: var(--cpsl-color-background-16);
  color: var(--cpsl-color-text-primary);
  font-size: 14px;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: var(--cpsl-color-accent-primary);
  }

  option {
    background: var(--cpsl-color-background-16);
    color: var(--cpsl-color-text-primary);
  }
`;
