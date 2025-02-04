import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import { CpslIcon } from '@getpara/react-components';
import styled from 'styled-components';
import { Text } from './StyledText';
import { DropdownOption } from '../../types';

interface DropdownSelectorProps {
  options: DropdownOption[];
  value?: DropdownOption;
  label: string;
  placeholder?: string;
  onChange: (selectedOption: DropdownOption) => void;
  isFont?: boolean;
}

export const DropdownSelector: React.FC<DropdownSelectorProps> = ({
  options,
  value,
  label,
  onChange,
  placeholder,
  isFont,
}) => {
  const [selectedOption, setSelectedOption] = useState<DropdownOption | undefined>(value);
  const [isOpen, setIsOpen] = useState(false);
  const [referenceWidth, setReferenceWidth] = useState<number | undefined>(undefined);

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleOptionSelect = (option: DropdownOption) => () => {
    setSelectedOption(option);
    onChange(option);
    setIsOpen(false);
  };

  useEffect(() => {
    value ? setSelectedOption(value) : setSelectedOption(undefined);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const referenceElement = refs.reference.current;
      const floatingElement = refs.floating.current;

      if (
        referenceElement instanceof Element &&
        !referenceElement.contains(target) &&
        floatingElement instanceof Element &&
        !floatingElement.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (refs.reference.current instanceof Element) {
        const rect = refs.reference.current.getBoundingClientRect();
        setReferenceWidth(rect.width);
      }
    }
    return () => {
      if (isOpen) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [isOpen, refs]);

  return (
    <>
      <Container>
        <Text variant="bodyS" weight="medium" color="primary">
          {label}
        </Text>
        <DropdownButton onClick={toggleDropdown} aria-haspopup="listbox" ref={refs.setReference}>
          <Text variant="bodyM" color={selectedOption ? 'primary' : 'secondary'}>
            {selectedOption ? selectedOption.label : placeholder ? placeholder : 'Select an option'}
          </Text>
          <IconWrapper $isOpen={isOpen}>
            <CpslIcon icon="chevronUp" />
          </IconWrapper>
        </DropdownButton>
      </Container>
      {isOpen &&
        ReactDOM.createPortal(
          <OptionsList
            ref={refs.setFloating}
            role="listbox"
            style={{
              ...floatingStyles,
              width: referenceWidth ? `${referenceWidth}px` : 'auto',
            }}
          >
            {options.map(option => (
              <OptionItem key={option.value} role="option" onClick={handleOptionSelect(option)}>
                <Text variant="bodyM" color="primary" style={{ fontFamily: isFont ? option.value : "'Inter', sans-serif" }}>
                  {option.label}
                </Text>
              </OptionItem>
            ))}
          </OptionsList>,
          document.body,
        )}
    </>
  );
};

const Container = styled.div``;

const DropdownButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f0f0f0;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  width: 100%;
  padding: 0.75rem;
`;

const IconWrapper = styled.span<{ $isOpen: boolean }>`
  transition: transform 0.2s ease-in-out;
  transform: rotate(${props => (props.$isOpen ? '0deg' : '180deg')});
  cpsl-icon {
    --width: 1rem;
    --height: 1rem;
    --icon-color: #616161;
  }
`;

const OptionsList = styled.ul`
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0.25rem 0.75rem;
  border: 1px solid #d6d6d6;
  border-radius: 0.75rem;
  padding: 0;
  margin: 0;
  list-style: none;
  z-index: 1000;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
`;

const OptionItem = styled.li`
  padding: 0.75rem;
  font-size: 1rem;
  line-height: 1.5rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;
