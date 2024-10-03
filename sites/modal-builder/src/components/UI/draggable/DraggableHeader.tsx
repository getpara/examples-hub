import React from 'react';
import styled from 'styled-components';
import { CpslIcon } from '@usecapsule/react-components';
import { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import { Text } from '../StyledText';
import { Switch } from '../StyledSwitch';

export interface DraggableHeaderProps {
  logo?: string;
  label: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  accordion: boolean;
  isExpanded: boolean;
  toggleExpand?: () => void;
  attributes?: DraggableAttributes;
  listeners?: DraggableSyntheticListeners;
  id: string;
  disabled?: boolean;
}

export const DraggableHeader: React.FC<DraggableHeaderProps> = ({
  logo,
  label,
  isEnabled,
  onToggle,
  accordion,
  isExpanded,
  toggleExpand,
  attributes,
  listeners,
  disabled,
}) => {
  return (
    <Header>
      <DragHandle {...attributes} {...listeners}>
        <CpslIcon icon="gridDots" color="#ADADAD" />
        {logo && <LogoImage src={logo} alt={`${label} logo`} />}
        <Text variant="bodyM" weight="medium">
          {label}
        </Text>
      </DragHandle>
      <RightContent>
        <Switch checked={isEnabled} onCheckedChange={onToggle} disabled={disabled} />
        {accordion && (
          <ChevronIcon $isExpanded={isExpanded} onClick={toggleExpand}>
            <CpslIcon icon="chevronUp" />
          </ChevronIcon>
        )}
      </RightContent>
    </Header>
  );
};

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const DragHandle = styled.div`
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const LogoImage = styled.img`
  width: 20px;
  height: 20px;
`;

const RightContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ChevronIcon = styled.div<{ $isExpanded: boolean }>`
  transition: transform 0.3s ease;
  transform: rotate(${({ $isExpanded }) => ($isExpanded ? '180deg' : '0deg')});
  cursor: pointer;
`;
