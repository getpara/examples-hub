import { useModal, useAccount, ModalStep, useClient } from '@getpara/react-sdk';
import { CpslButton, CpslIcon, CpslSelect, CpslSelectItem, CpslCard, CpslText } from '@getpara/react-components';
import styled from 'styled-components';
import { useState, useEffect } from 'react';

type StepOption = ModalStep | 'default';

export const FloatingModalOpener = () => {
  const { openModal } = useModal();
  const { isConnected } = useAccount();
  const para = useClient();
  const [selectedStep, setSelectedStep] = useState<StepOption>('default');

  const handleOpenModal = () => {
    // Open modal with or without step based on selection
    if (selectedStep === 'default') {
      openModal();
    } else {
      openModal({ step: selectedStep });
    }
  };

  const handleResetStorage = async () => {
    try {
      await para?.clearStorage();
      console.log('✅ Para storage cleared successfully');
      // Optionally reload the page to reset the entire state
      window.location.reload();
    } catch (error) {
      console.error('❌ Failed to clear Para storage:', error);
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
              onCpslSelectValueChange={(e: CustomEvent<string>) => setSelectedStep(e.detail as StepOption)}
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

          <ButtonGroup>
            <CpslButton
              variant="primary"
              onClick={handleOpenModal}
              size="small"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                whiteSpace: 'nowrap',
                fontSize: '14px',
              }}
            >
              <CpslIcon icon="menu" size="small" />
              <span>Open Modal</span>
            </CpslButton>

            <CpslButton
              variant="secondary"
              onClick={handleResetStorage}
              size="small"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                whiteSpace: 'nowrap',
                fontSize: '14px',
              }}
            >
              <CpslIcon icon="refreshCw" size="small" />
              <span>Reset Storage</span>
            </CpslButton>
          </ButtonGroup>
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
  gap: 12px;
  margin-top: 16px;
  min-width: 0; /* Allow shrinking */
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const DropdownContainer = styled.div`
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 1; /* Allow shrinking when needed */
  min-width: 0; /* Allow content to shrink if needed */
  max-width: 100%; /* Prevent overflow */

  @media (max-width: 640px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: stretch;
  }
`;
