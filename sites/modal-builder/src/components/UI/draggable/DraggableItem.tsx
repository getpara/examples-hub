import React, { useState, ReactElement, cloneElement } from 'react';
import styled from 'styled-components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableHeader, DraggableHeaderProps } from './DraggableHeader';
import { DraggableBody, DraggableBodyProps } from './DraggableBody';

export interface DraggableItemProps {
  id: string;
  children:
    | ReactElement<DraggableHeaderProps | DraggableBodyProps>
    | ReactElement<DraggableHeaderProps | DraggableBodyProps>[];
  backgroundColor?: string;
  padding?: string;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ id, children, backgroundColor, padding }) => {
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
