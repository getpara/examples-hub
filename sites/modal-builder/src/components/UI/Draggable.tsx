import React, { useState, useEffect, ReactElement, cloneElement, PropsWithChildren } from 'react';
import styled from 'styled-components';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DraggableAttributes,
  DraggableSyntheticListeners,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CpslIcon } from '@usecapsule/react-components';
import { Text } from './StyledText';
import { Switch } from './StyledSwitch';

interface DraggableAreaProps {
  children: ReactElement[];
  onOrderChange?: (newOrder: ReactElement[]) => void;
}

const DraggableArea: React.FC<DraggableAreaProps> = ({ children, onOrderChange }) => {
  const [items, setItems] = useState<React.ReactElement[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setItems(children);
  }, [children]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      const oldIndex = items.findIndex(item => item.props.id === active.id);
      const newIndex = items.findIndex(item => item.props.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      if (onOrderChange) {
        onOrderChange(newItems);
      }
    }

    setActiveId(null);
  };

  const itemIds = items.map(item => item.props.id);

  return (
    <DraggableAreaContainer>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {items}
        </SortableContext>
        <DragOverlay>{activeId ? items.find(item => item.props.id === activeId) : null}</DragOverlay>
      </DndContext>
    </DraggableAreaContainer>
  );
};

export interface DraggableBodyProps {
  isExpanded: boolean;
}

const DraggableBody: React.FC<PropsWithChildren<DraggableBodyProps>> = ({ children, isExpanded }) => {
  return (
    <BodyContainer className="draggable-body" $isExpanded={isExpanded}>
      <BodyContent>{children}</BodyContent>
    </BodyContainer>
  );
};

interface DraggableHeaderProps {
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

const DraggableHeader: React.FC<DraggableHeaderProps> = ({
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

export interface DraggableItemProps {
  id: string;
  children:
    | ReactElement<DraggableHeaderProps | DraggableBodyProps>
    | ReactElement<DraggableHeaderProps | DraggableBodyProps>[];
  backgroundColor?: string;
  padding?: string;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, children, backgroundColor, padding }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  const clonedChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;

    if (isDraggableHeader(child)) {
      const draggableHeaderProps: Partial<DraggableHeaderProps> = {
        attributes,
        listeners,
        isExpanded,
        toggleExpand,
        id,
      };
      return cloneElement(child, draggableHeaderProps);
    }

    if (isDraggableBody(child)) {
      return cloneElement(child, { isExpanded });
    }

    return child;
  });

  return (
    <ItemContainer
      ref={setNodeRef}
      style={style}
      $backgroundColor={backgroundColor || 'white'}
      $padding={padding}
      $isDragging={isDragging}
    >
      {clonedChildren}
    </ItemContainer>
  );
};

export function isDraggableHeader(element: ReactElement): element is ReactElement<DraggableHeaderProps> {
  return element.type === DraggableHeader;
}

export function isDraggableBody(element: ReactElement): element is ReactElement<DraggableBodyProps> {
  return element.type === DraggableBody;
}

// Styled components
const DraggableAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

const ItemContainer = styled.div<{ $backgroundColor: string; $padding?: string; $isDragging: boolean }>`
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 0.75rem;
  padding: ${({ $padding }) => $padding || '1rem'};
  gap: 0.5rem;
  display: flex;
  flex-direction: column;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1)};
  box-shadow: ${({ $isDragging }) => ($isDragging ? '0 0 10px rgba(0, 0, 0, 0.1)' : 'none')};
  transform: ${({ $isDragging }) => ($isDragging ? 'scale(1.02)' : 'none')};
  transition:
    opacity 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
`;

export { DraggableArea, DraggableBody, DraggableHeader, DraggableItem };
