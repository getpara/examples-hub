import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import styled from 'styled-components';
import { Text } from './StyledText';
import { logDebug } from '../../utils';

interface ColorInputPickerProps {
  name?: string;
  color?: string;
  onColorChange: (color: string) => void;
  label?: string;
}

const validateColor = (value: string) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) || value === '';
};

export const ColorInputPicker: React.FC<ColorInputPickerProps> = ({ color: colorProp, onColorChange, label, name }) => {
  const [inputValue, setInputValue] = useState(colorProp);
  const [isValidColor, setIsValidColor] = useState(validateColor(colorProp || ''));
  const [isHexPickerOpen, setIsHexPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logDebug('ColorInputPicker', colorProp);
    setInputValue(colorProp || '');
    setIsValidColor(validateColor(colorProp || ''));
  }, [colorProp]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsHexPickerOpen(false);
      }
    };
    if (isHexPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHexPickerOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const isValid = validateColor(value);
    setIsValidColor(isValid);
    if (isValid) {
      onColorChange(value);
    }
  };

  const handleColorChange = (newColor: string) => {
    setInputValue(newColor);
    setIsValidColor(true);
    onColorChange(newColor);
  };

  const togglePicker = () => setIsHexPickerOpen(prev => !prev);

  return (
    <Container>
      <Text variant="bodyS" weight="medium" color="primary">
        {label}
      </Text>
      <InputContainer $isValid={isValidColor}>
        <Input
          name={name}
          type="text"
          value={inputValue}
          placeholder="#000000"
          onChange={handleInputChange}
          maxLength={7}
          aria-invalid={!isValidColor}
        />
        <div style={{ position: 'relative' }} ref={pickerRef}>
          <ColorButton
            $bgColor={isValidColor ? (inputValue ? inputValue : '#000000') : '#000000'}
            onClick={togglePicker}
            aria-label="Open color picker"
          />
          {isHexPickerOpen && (
            <PopoverContent>
              <HexColorPicker color={isValidColor ? inputValue : '#000000'} onChange={handleColorChange} />
            </PopoverContent>
          )}
        </div>
      </InputContainer>
    </Container>
  );
};

const Container = styled.div``;

const InputContainer = styled.div<{ $isValid: boolean }>`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 0.75rem;
  padding: 0.75rem;
  gap: 0.5rem;
  border: ${({ $isValid }) => ($isValid ? 'none' : '1px solid red')};
`;

const Input = styled.input`
  flex-grow: 1;
  border: none;
  font-size: 1rem;
  line-height: 1.5rem;
  background-color: transparent;
  outline: none;
  ::placeholder {
    color: #616161;
    opacity: 1;
  }
`;

const ColorButton = styled.button<{ $bgColor: string }>`
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  background-color: ${props => props.$bgColor};
`;

const PopoverContent = styled.div`
  position: absolute;
  z-index: 1000;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
`;
