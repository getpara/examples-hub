import React from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import styled from 'styled-components';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
}

const StyledSwitchRoot = styled(RadixSwitch.Root)`
  width: 44px;
  margin: 0;
  height: 1.5rem;
  background-color: rgb(240, 240, 240);
  padding: 0;
  border-radius: 1000px;
  border: 1px solid #d6d6d6;
  position: relative;
  cursor: pointer;
  transition:
    background-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.08) inset;

  &[data-state='checked'] {
    background-color: rgb(20, 20, 20);
    box-shadow: none;
  }

  &[data-state='unchecked'] {
    background-color: rgb(240, 240, 240);
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.08) inset;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px blue;
  }
`;

const StyledSwitchThumb = styled(RadixSwitch.Thumb)`
  display: block;
  width: 20px;
  height: 20px;
  background-color: rgb(255, 255, 255);
  border-radius: 1000px;
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.1);
  transition: transform 0.15s ease-in-out;
  transform: translateX(1px);

  &[data-state='checked'] {
    transform: translateX(21px);
  }

  &[data-state='unchecked'] {
    transform: translateX(1px);
  }
`;

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, id, disabled, name, value }) => {
  return (
    <StyledSwitchRoot
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      name={name}
      value={value}
    >
      <StyledSwitchThumb />
    </StyledSwitchRoot>
  );
};
