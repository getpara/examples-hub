import React, { ReactElement } from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  DraggableArea,
  DraggableHeader,
  DraggableItem,
  Text,
} from '../UI';
import { OnRampProvider } from '@usecapsule/react-sdk';
import { ONRAMPS_CONFIGS } from '../../constants';
import { ReorderableType } from '../../types';
import { extractId } from '../../utils';
import styled from 'styled-components';
import { CpslIcon } from '@usecapsule/react-components';
interface OnRampsConfiguratorProps {}

export const OnRampsConfigurator: React.FC<OnRampsConfiguratorProps> = () => {
  const [onRampsOrder, setOnRampsOrder] = React.useState<OnRampProvider[]>(Object.keys(ONRAMPS_CONFIGS) as OnRampProvider[]);

  const [enabledOnRamps, setEnabledOnRamps] = React.useState<OnRampProvider[]>([]);

  const handleReorder = <T extends ReorderableType>(newOrder: ReactElement[]) => {
    const newOrderIds: T[] = newOrder.map(item => extractId<T>(item)).filter((id): id is T => id !== null);
    return newOrderIds;
  };

  const handleOnRampsReorder = (newOrder: React.ReactElement[]) => {
    const newOrderIds = handleReorder<OnRampProvider>(newOrder);
    setOnRampsOrder(newOrderIds);
  };

  const handleToggleOnRampProvider = (provider: OnRampProvider) => {
    if (enabledOnRamps.includes(provider)) {
      setEnabledOnRamps(enabledOnRamps.filter(enabledProvider => enabledProvider !== provider));
    } else {
      setEnabledOnRamps([...enabledOnRamps, provider]);
    }
  };

  return (
    <AccordionItem value="on-ramps" enableToggle onToggleChange={() => {}}>
      <AccordionTrigger
        label="On Ramps"
        secondaryText="Choose which providers and assets are available to your users. Full set up requires adding the provider’s API keys in the Capsule Developer Portal and configuring the assets in the On Ramps section."
      />
      <AccordionContent>
        <DraggableArea onOrderChange={handleOnRampsReorder}>
          {onRampsOrder.map(provider => {
            return (
              <DraggableItem key={provider} id={provider} backgroundColor="#f0f0f0">
                <DraggableHeader
                  id={provider}
                  logo={ONRAMPS_CONFIGS[provider].logo}
                  label={ONRAMPS_CONFIGS[provider].label}
                  isEnabled={enabledOnRamps.includes(provider)}
                  onToggle={() => handleToggleOnRampProvider(provider)}
                  accordion={false}
                  isExpanded={false}
                />
              </DraggableItem>
            );
          })}
        </DraggableArea>
        <ActionButton
          variant="secondary"
          onClick={() => window.open('https://developer.usecapsule.com', '_blank')}
          size="small"
        >
          <ButtonContent>
            <Text variant="bodyS" weight="medium" color="primary">
              Configure In Developer Portal
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
