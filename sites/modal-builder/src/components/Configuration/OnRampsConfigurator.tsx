import React, { useState, useCallback } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger, Button, Text } from '../UI';
import { DraggableArea, DraggableItem } from '../UI/draggable';
import { OnRampProvider } from '@usecapsule/react-sdk';
import { ONRAMPS_CONFIGS } from '../../constants';
import { CpslIcon } from '@usecapsule/react-components';
import styled from 'styled-components';

const DEVELOPER_PORTAL_URL = 'https://developer.usecapsule.com';
const DEVELOPER_PORTAL_LABEL = 'Configure In Developer Portal';
const SECTION_LABEL = 'On Ramps';
const SECTION_SECONDARY_TEXT =
  'Choose which providers and assets are available to your users. This configuration is managed in the Capsule Developer Portal in the On & Off Ramps section.';
const DRAGGABLE_BACKGROUND_COLOR = '#f0f0f0';

export const OnRampsConfigurator: React.FC = () => {
  const [onRampsOrder, setOnRampsOrder] = useState<OnRampProvider[]>(Object.keys(ONRAMPS_CONFIGS) as OnRampProvider[]);
  const [enabledOnRamps, setEnabledOnRamps] = useState<OnRampProvider[]>([]);

  const handleOnRampsReorder = useCallback((newOrder: OnRampProvider[]) => {
    setOnRampsOrder(newOrder);
  }, []);

  const handleToggleOnRampProvider = useCallback((provider: OnRampProvider) => {
    setEnabledOnRamps(prev => (prev.includes(provider) ? prev.filter(item => item !== provider) : [...prev, provider]));
  }, []);

  const handleOpenDeveloperPortal = useCallback(() => {
    window.open(DEVELOPER_PORTAL_URL, '_blank');
  }, []);

  return (
    <AccordionItem value="on-ramps" enableToggle onToggleChange={() => {}}>
      <AccordionTrigger label={SECTION_LABEL} secondaryText={SECTION_SECONDARY_TEXT} />
      <AccordionContent>
        <DraggableArea items={onRampsOrder} onOrderChange={handleOnRampsReorder}>
          {provider => (
            <DraggableItem
              key={provider}
              value={provider}
              label={ONRAMPS_CONFIGS[provider].label}
              logo={ONRAMPS_CONFIGS[provider].logo}
              backgroundColor={DRAGGABLE_BACKGROUND_COLOR}
              isEnabled={enabledOnRamps.includes(provider)}
              onToggle={() => handleToggleOnRampProvider(provider)}
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
