import React, { useState, useRef, useEffect, ChangeEvent, FocusEvent, ClipboardEvent } from 'react';
import styled, { css } from 'styled-components';
import IMask, { InputMask } from 'imask';

type AutocompleteTypes = 'off' | 'on';
type TextFieldTypes = 'text' | 'email' | 'search' | 'password' | 'tel' | 'url' | 'number' | 'date';
type IconType = string;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
  autocomplete?: AutocompleteTypes;
  autocorrect?: 'on' | 'off';
  autofocus?: boolean;
  disabled?: boolean;
  contrastText?: boolean;
  enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  errorText?: string;
  mask?: string;
  helperText?: string;
  inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  label?: string;
  max?: string | number;
  maxlength?: number;
  min?: string | number;
  minlength?: number;
  multiple?: boolean;
  name?: string;
  pattern?: string;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  showOptionalLabel?: boolean;
  spellcheck?: boolean;
  startIconSrc?: string;
  startIcon?: IconType;
  step?: string;
  type?: TextFieldTypes;
  value?: string;
  onInput?: (event: ChangeEvent<HTMLInputElement>) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void;
}

const Container = styled.div<{ $disabled: boolean; $focused: boolean; $hasValue: boolean; $contrastText: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-family: inherit;

  ${props =>
    props.$contrastText &&
    css`
      --input-color: rgb(0, 0, 0);
    `}

  ${props =>
    !props.$hasValue &&
    css`
      --container-border-color: rgb(214, 214, 214);
      --input-color: rgb(133, 133, 133);
    `}

  ${props =>
    props.$disabled &&
    css`
      --container-background-color: rgb(235, 235, 235);
      --input-background-color: rgb(235, 235, 235);
      --input-color: rgb(134, 134, 134);
      --container-border-color: transparent;
    `}

  ${props =>
    props.$focused &&
    css`
      --container-box-shadow: 0px 0px 0px 2px rgb(0, 0, 0);
      --container-border-color: rgb(20, 20, 20);
      --container-background-color: rgb(255, 255, 255);
    `}
`;

const InputContainer = styled.div<{ $error: boolean; $disabled: boolean }>`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  height: 48px;
  gap: 0.5rem;
  padding: 0px 0.75rem 0px 0.75rem;
  border-style: solid;
  border-width: 1px;
  border-color: ${props => (props.$error ? 'rgb(240, 68, 56)' : 'var(--container-border-color)')};
  border-radius: 0.75rem;
  background: ${props => (props.$disabled ? 'rgb(235, 235, 235)' : 'rgb(255, 255, 255)')};
  box-shadow: none;
  transition: all 0.15s ease-in-out;
`;

const NativeInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  height: 100%;
  box-sizing: border-box;
  font-size: 1rem;
  font-weight: 400;
  color: var(--input-color);
  background: var(--input-background-color);

  &:focus,
  &:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: rgb(133, 133, 133);
    opacity: 1;
  }

  &::-moz-selection {
    color: rgb(246, 246, 246);
    background: rgb(92, 92, 92);
  }

  &::selection {
    color: rgb(246, 246, 246);
    background: rgb(92, 92, 92);
  }
`;

const Label = styled.label`
  display: inline-block;
  color: rgb(20, 20, 20);
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0px;
`;

const OptionalLabel = styled.span`
  display: inline-block;
  color: rgb(133, 133, 133);
  font-size: 0.75rem;
  font-weight: 500;
`;

const HelperTextContainer = styled.div<{ $error: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${props => (props.$error ? 'rgb(240, 68, 56)' : 'rgb(133, 133, 133)')};
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 0px;
`;

export const Input: React.FC<InputProps> = ({
  autocapitalize = 'off',
  autocomplete = 'off',
  autocorrect = 'off',
  autofocus = false,
  disabled = false,
  contrastText = false,
  enterkeyhint,
  errorText,
  mask,
  helperText,
  inputmode,
  label,
  max,
  maxlength,
  min,
  minlength,
  multiple,
  name,
  pattern,
  placeholder = '',
  readonly = false,
  required = false,
  showOptionalLabel = false,
  spellcheck = false,
  startIconSrc,
  startIcon,
  step,
  type = 'text',
  value,
  onInput,
  onChange,
  onBlur,
  onFocus,
  onPaste,
  children,
  ...rest
}) => {
  const [hasFocus, setHasFocus] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value || '');
  const [isError, setIsError] = useState<boolean>(!!errorText);
  const inputRef = useRef<HTMLInputElement>(null);
  const maskedRef = useRef<InputMask | null>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (mask && inputRef.current) {
      maskedRef.current = IMask(inputRef.current, {
        mask: mask,
        definitions: {
          '#': /[\d]/,
        },
      });
      maskedRef.current.on('accept', () => {
        setInputValue(maskedRef.current?.unmaskedValue || '');
      });
    }
    return () => {
      maskedRef.current?.destroy();
    };
  }, [mask]);

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setHasFocus(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setHasFocus(false);
    setIsError(!!errorText);
    onBlur && onBlur(e);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange && onChange(e);
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    onInput && onInput(e);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    onPaste && onPaste(e);
  };

  return (
    <Container $disabled={disabled} $focused={hasFocus} $hasValue={!!inputValue} $contrastText={contrastText}>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required ? '*' : ' '}
          {!required && showOptionalLabel && <OptionalLabel>(optional)</OptionalLabel>}
        </Label>
      )}
      <InputContainer $error={isError} $disabled={disabled}>
        {startIconSrc || startIcon ? (
          <div>{startIconSrc ? <img src={startIconSrc} alt="" /> : <span>{startIcon}</span>}</div>
        ) : null}
        <NativeInput
          ref={inputRef}
          id={name}
          name={name}
          type={type}
          value={inputValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onInput={handleInput}
          onPaste={handlePaste}
          autoCapitalize={autocapitalize}
          autoComplete={autocomplete}
          autoCorrect={autocorrect}
          autoFocus={autofocus}
          disabled={disabled}
          inputMode={inputmode}
          max={max}
          maxLength={maxlength}
          min={min}
          minLength={minlength}
          multiple={multiple}
          pattern={pattern}
          placeholder={placeholder}
          readOnly={readonly}
          required={required}
          spellCheck={spellcheck}
          step={step}
          {...rest}
          enterKeyHint={enterkeyhint}
        />
        {children}
      </InputContainer>
      {(errorText || helperText) && (
        <HelperTextContainer $error={!!errorText}>
          <span>{errorText || helperText}</span>
        </HelperTextContainer>
      )}
    </Container>
  );
};
