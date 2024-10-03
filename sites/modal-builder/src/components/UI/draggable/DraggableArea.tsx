import React, { useState, useEffect, ReactElement } from 'react';
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
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface DraggableAreaProps {
  children: ReactElement[];
  onOrderChange?: (newOrder: ReactElement[]) => void;
}

export const DraggableArea: React.FC<DraggableAreaProps> = ({ children, onOrderChange }) => {
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

const DraggableAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
