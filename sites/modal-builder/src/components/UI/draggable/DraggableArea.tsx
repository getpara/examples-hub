import React from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';

interface DraggableAreaProps<T> {
  items: T[];
  onOrderChange: (newOrder: T[]) => void;
  children: (item: T, index: number, isLast: boolean) => React.ReactNode;
}

export function DraggableArea<T>({ items, onOrderChange, children }: DraggableAreaProps<T>) {
  const handleReorder = (newOrder: T[]) => {
    onOrderChange(newOrder);
  };

  return (
    <Reorder.Group as="div" axis="y" values={items} onReorder={handleReorder}>
      <AnimatePresence>{items.map((item, index) => children(item, index, index === items.length - 1))}</AnimatePresence>
    </Reorder.Group>
  );
}
