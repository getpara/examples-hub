import React, { ChangeEvent, ClipboardEvent } from 'react';
import styled from 'styled-components';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onInput?: (event: ChangeEvent<HTMLInputElement>) => void;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  id,
  name,
  type = 'text',
  value,
  placeholder,
  className,
  onChange,
  onInput,
  onPaste,
  ...rest
}) => {
  return (
    <StyledInput
      id={id}
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      className={className}
      onChange={onChange}
      onInput={onInput}
      onPaste={onPaste}
      {...rest}
    />
  );
};

const StyledInput = styled.input`
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
