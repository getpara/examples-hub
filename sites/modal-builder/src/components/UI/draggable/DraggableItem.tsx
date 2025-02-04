import React, { FC, MouseEvent } from 'react';
import styled from 'styled-components';
import { Reorder, useDragControls } from 'framer-motion';
import { CpslIcon } from '@getpara/react-components';
import { Switch } from '../StyledSwitch';
import { Text } from '../StyledText';

interface DraggableItemProps {
  value: string;
  logo?: string;
  label: string;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  accordion?: boolean;
  isExpanded?: boolean;
  toggleExpand?: () => void;
  disabled?: boolean;
  backgroundColor?: string;
  padding?: string;
  children?: React.ReactNode;
  isLastItem?: boolean; // New prop to identify the last item
}

export const DraggableItem: FC<DraggableItemProps> = ({
  value,
  logo,
  label,
  isEnabled,
  onToggle,
  accordion = false,
  isExpanded = false,
  toggleExpand,
  disabled,
  backgroundColor,
  padding,
  children,
  isLastItem = false, // Default to false
}) => {
  const dragControls = useDragControls();

  function handlePointerDown(e: MouseEvent) {
    dragControls.start(e as any);
  }

  return (
    <Reorder.Item as="div" value={value} dragListener={false} dragControls={dragControls}>
      <ItemContainer $backgroundColor={backgroundColor || 'white'} $padding={padding} $isLastItem={isLastItem}>
        <Header>
          <DragHandle onPointerDown={handlePointerDown}>
            <CpslIcon icon="gridDots" color="#ADADAD" />
            {logo && <LogoImage src={logo} alt={label} />}
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

        {children ? (
          accordion ? (
            <BodyContainer $isExpanded={isExpanded}>
              <BodyContent>{children}</BodyContent>
            </BodyContainer>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {children}
            </div>
          )
        ) : null}
      </ItemContainer>
    </Reorder.Item>
  );
};

const ItemContainer = styled.div<{
  $backgroundColor: string;
  $padding?: string;
  $isLastItem: boolean;
}>`
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 0.75rem;
  padding: ${({ $padding }) => $padding || '1rem'};
  display: flex;
  flex-direction: column;
  transition:
    opacity 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
  margin-bottom: ${({ $isLastItem }) => ($isLastItem ? '0' : '0.5rem')};
  gap: 0.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  cursor: grab;
`;

const LogoImage = styled.img`
  width: 20px;
  height: 20px;
`;

const RightContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChevronIcon = styled.div<{ $isExpanded: boolean }>`
  transition: transform 0.3s ease;
  transform: rotate(${({ $isExpanded }) => ($isExpanded ? '180deg' : '0deg')});
  cursor: pointer;
`;

const BodyContainer = styled.div<{ $isExpanded: boolean }>`
  overflow: hidden;
  transition:
    max-height 0.3s ease-out,
    opacity 0.3s ease-out;
  max-height: ${({ $isExpanded }) => ($isExpanded ? '1000px' : '0')};
  opacity: ${({ $isExpanded }) => ($isExpanded ? '1' : '0')};
`;

const BodyContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
`;
