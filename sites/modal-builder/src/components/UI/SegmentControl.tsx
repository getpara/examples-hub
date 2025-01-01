import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import styled from 'styled-components';
import { CpslIcon } from '@usecapsule/react-components';
import { Text } from './StyledText';
import { SegmentItem } from '../../types';

interface SegmentControlProps {
  items: SegmentItem[];
  onSelect: (value: string) => void;
  defaultSelectedIndex?: number;
  fullWidth?: boolean;
}

export const SegmentControl: React.FC<SegmentControlProps> = ({
  items,
  onSelect,
  defaultSelectedIndex = 0,
  fullWidth = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultSelectedIndex);
  const [dimensions, setDimensions] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const updateSelectedDimensions = () => {
    const selected = itemRefs.current[selectedIndex];
    if (selected && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const selectedRect = selected.getBoundingClientRect();
      setDimensions({
        width: selectedRect.width,
        left: selectedRect.left - containerRect.left,
      });
    }
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onSelect(items[index].value);
  };

  useEffect(() => {
    if (defaultSelectedIndex !== selectedIndex) {
      setSelectedIndex(defaultSelectedIndex);
    }
  }, [defaultSelectedIndex]);

  useEffect(() => {
    if (defaultSelectedIndex < 0 || defaultSelectedIndex >= items.length) {
      console.warn('defaultSelectedIndex is out of bounds, defaulting to 0');
      setSelectedIndex(0);
    } else {
      setSelectedIndex(defaultSelectedIndex);
    }
  }, [defaultSelectedIndex, items.length]);

  useLayoutEffect(() => {
    updateSelectedDimensions();
  }, [selectedIndex, items]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateSelectedDimensions();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedIndex, items]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Container ref={containerRef} $fullWidth={fullWidth}>
      <SelectedBackground $width={dimensions.width} $left={dimensions.left} />
      {items.map((item, index) => (
        <SegmentButton
          key={index}
          ref={el => (itemRefs.current[index] = el)}
          onClick={() => handleSelect(index)}
          aria-pressed={selectedIndex === index}
          role="button"
        >
          <IconWrapper $isSelected={selectedIndex === index}>
            <CpslIcon icon={item.icon} />
          </IconWrapper>
          <Text variant="bodyS" weight="medium" color={selectedIndex === index ? 'primary' : 'secondary'}>
            {item.label}
          </Text>
        </SegmentButton>
      ))}
    </Container>
  );
};

const Container = styled.div<{ $fullWidth: boolean }>`
  position: relative;
  display: flex;
  padding: 0.25rem;
  background-color: #f0f0f0;
  border: 1px solid #d6d6d6;
  border-radius: 9999px;
  width: ${props => (props.$fullWidth ? '100%' : 'fit-content')};
`;

const SelectedBackground = styled.div<{ $width: number; $left: number }>`
  position: absolute;
  background-color: white;
  border-radius: 9999px;
  top: 0.25rem;
  bottom: 0.25rem;
  width: ${props => props.$width}px;
  left: ${props => props.$left}px;
  transition:
    width 0.3s ease,
    left 0.3s ease;
  will-change: width, left;
`;

const SegmentButton = styled.button`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background-color: transparent;
  transition: color 0.2s;
  border: none;
  gap: 0.25rem;
  z-index: 1;
  cursor: pointer;
  outline: none;
  box-shadow: none;

  &:focus {
    outline: none;
  }
`;

const IconWrapper = styled.div<{ $isSelected: boolean }>`
  cpsl-icon {
    --width: 1rem;
    --height: 1rem;
    --icon-color: ${props => (props.$isSelected ? '#141414' : '#858585')};
  }
`;
