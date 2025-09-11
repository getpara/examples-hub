import { useModal, useAccount, ModalStep } from '@getpara/react-sdk';
import { CpslButton, CpslIcon, CpslSelect, CpslSelectItem, CpslCard, CpslText } from '@getpara/react-components';
import styled from 'styled-components';
import { useState, useEffect } from 'react';

type StepOption = ModalStep | 'default';

export const FloatingModalOpener = () => {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const [selectedStep, setSelectedStep] = useState<StepOption>('default');

  const handleOpenModal = () => {
    // Open modal with or without step based on selection
    if (selectedStep === 'default') {
      openModal();
    } else {
      openModal({ step: selectedStep });
    }
  };

  // Update selected step when connection status changes
  useEffect(() => {
    setSelectedStep('default'); // Keep default as the default option
  }, [isConnected]);

  // Get all available modal steps
  const modalSteps = Object.values(ModalStep);

  // Create options array with default option first
  const stepOptions = [
    { value: 'Default Step' as const, label: 'Default (Auto)' },
    ...modalSteps.map(step => ({
      value: step,
      label: step
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase()),
    })),
  ];

  return (
    <CardContainer>
      <CpslCard style={{ width: '100%' }}>
        <CpslText variant="headingXS" weight="semiBold">
          Modal Controls
        </CpslText>

        <FloatingBar>
          <DropdownContainer>
            <CpslSelect
              selectedValue={selectedStep}
              onCpslSelectValueChange={e => setSelectedStep(e.detail as StepOption)}
              placeholder="Select step"
              style={{ minWidth: '180px' }}
            >
              {stepOptions.map(option => (
                <CpslSelectItem key={option.value} slot="items" value={option.value}>
                  {option.label}
                </CpslSelectItem>
              ))}
            </CpslSelect>
          </DropdownContainer>

          <CpslButton
            variant="primary"
            onClick={handleOpenModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <CpslIcon icon="menu" />
            <span>Open Modal</span>
          </CpslButton>
        </FloatingBar>
      </CpslCard>
    </CardContainer>
  );
};

const CardContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  margin-bottom: 16px;

  @media (max-width: 1023px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    margin-bottom: 0;
    border-radius: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 16px; /* Match content container padding */
    background: var(--cpsl-color-background-primary); /* Ensure background shows */
  }
`;

const FloatingBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 640px) {
    gap: 8px;
    flex-wrap: wrap;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const DropdownContainer = styled.div`
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 100%;
  }
`;
