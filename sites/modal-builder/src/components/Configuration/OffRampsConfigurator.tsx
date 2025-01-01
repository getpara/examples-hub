import React, { useState, useCallback } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger, Button, Text } from '../UI';
import { DraggableArea, DraggableItem } from '../UI/draggable';
import { OnRampProvider } from '@usecapsule/react-sdk';
import { ONRAMPS_CONFIGS } from '../../constants';
import { CpslIcon } from '@usecapsule/react-components';
import styled from 'styled-components';

const DEVELOPER_PORTAL_URL = 'https://developer.usecapsule.com';
const DEVELOPER_PORTAL_LABEL = 'Configure In Developer Portal';
const SECTION_LABEL = 'Off Ramps';
const SECTION_SECONDARY_TEXT =
  'Choose which providers and assets are available to your users. This configuration is managed in the Capsule Developer Portal in the On & Off Ramps section.';
const DRAGGABLE_BACKGROUND_COLOR = '#f0f0f0';

export const OffRampsConfigurator: React.FC = () => {
  const [offRampsOrder, setOffRampsOrder] = useState<OnRampProvider[]>(Object.keys(ONRAMPS_CONFIGS) as OnRampProvider[]);
  const [enabledOffRamps, setEnabledOffRamps] = useState<OnRampProvider[]>([]);

  const handleOffRampsReorder = useCallback((newOrder: OnRampProvider[]) => {
    setOffRampsOrder(newOrder);
  }, []);

  const handleToggleOffRampProvider = useCallback((provider: OnRampProvider) => {
    setEnabledOffRamps(prev => (prev.includes(provider) ? prev.filter(item => item !== provider) : [...prev, provider]));
  }, []);

  const handleOpenDeveloperPortal = useCallback(() => {
    window.open(DEVELOPER_PORTAL_URL, '_blank');
  }, []);

  return (
    <AccordionItem value="off-ramps" enableToggle onToggleChange={() => {}}>
      <AccordionTrigger label={SECTION_LABEL} secondaryText={SECTION_SECONDARY_TEXT} />
      <AccordionContent>
        <DraggableArea items={offRampsOrder} onOrderChange={handleOffRampsReorder}>
          {provider => (
            <DraggableItem
              key={provider}
              value={provider}
              label={ONRAMPS_CONFIGS[provider].label}
              logo={ONRAMPS_CONFIGS[provider].logo}
              backgroundColor={DRAGGABLE_BACKGROUND_COLOR}
              isEnabled={enabledOffRamps.includes(provider)}
              onToggle={() => handleToggleOffRampProvider(provider)}
            />
          )}
        </DraggableArea>

        <ActionButton variant="secondary" onClick={handleOpenDeveloperPortal} size="small">
          <ButtonContent>
            <Text variant="bodyS" weight="medium" color="primary">
              {DEVELOPER_PORTAL_LABEL}
            </Text>
            <ButtonIcon icon="linkExternal" />
          </ButtonContent>
        </ActionButton>
      </AccordionContent>
    </AccordionItem>
  );
};

const ActionButton = styled(Button)`
  margin-top: 1rem;
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonIcon = styled(CpslIcon)`
  --width: 1rem;
  --height: 1rem;
  --icon-color: #000000;
`;
