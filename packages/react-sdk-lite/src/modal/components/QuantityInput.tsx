import { safeStyled } from '@getpara/react-common';

export function QuantityInput({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  size = '72px',
  symbol,
}: {
  value: string | null;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange: (_: string | null) => void;
  placeholder?: string;
  size?: string;
  symbol?: string;
}) {
  return (
    <Container style={{ fontSize: size, position: 'relative' }}>
      {symbol && <CurrencySign slot="start">{symbol}</CurrencySign>}
      <Input
        value={value ?? ''}
        onFocus={e => {
          e.currentTarget.select();
          onFocus?.();
        }}
        onKeyDown={e => {
          // Allow backspace, delete, and navigation keys
          if (
            !/^(\d|\.)$/.test(e.key) &&
            !['Delete', 'Backspace', 'Tab', 'Shift', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)
          ) {
            e.preventDefault();
          }
        }}
        onChange={e => {
          const rawValue = e.currentTarget.value;

          // If input is completely empty, set to null to show placeholder
          if (rawValue === '') {
            onChange(null);
            return;
          }

          // Filter to only allow digits and decimal point
          const numericValue = rawValue.replace(/[^0-9.]/g, '');

          // If after filtering there's nothing left, set to null
          if (numericValue === '') {
            onChange(null);
            return;
          }

          // Check if it's a valid number format (allows partial decimals like "0." or ".5")
          // This regex allows: digits, optional decimal point, more digits
          const isValidNumberFormat = /^\d*\.?\d*$/.test(numericValue);

          if (isValidNumberFormat) {
            onChange(numericValue);
          } else {
            // Invalid format, set to null
            onChange(null);
          }
        }}
        onBlur={e => {
          const numericValue = (e.currentTarget.value || '').replace(/[^0-9.]/g, '');
          if (numericValue === '') {
            onChange(null);
          } else {
            // Parse to validate the number, but preserve the original format if it's valid
            // This allows parent components to format it appropriately (e.g., with trailing zeros for currency)
            const parsed = parseFloat(numericValue);
            if (!isNaN(parsed)) {
              // Return the parsed value as string, but parent will format it with appropriate decimals
              onChange(parsed.toString());
            } else {
              onChange(null);
            }
          }
          onBlur?.();
        }}
        placeholder={placeholder || '0'}
      />
    </Container>
  );
}

const Container = safeStyled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--cpsl-font-family);
  color: var(--cpsl-color-text-primary);
`;

const CurrencySign = safeStyled.div`
  position: relative;
  left: 0px;
`;

const Input = safeStyled.input`
  font-family: var(--cpsl-font-family);
  font-size: inherit;
  color: inherit;
  background-color: transparent;
  height: auto;
  border-width: 0;
  text-align: center;
  width: 100%;
  outline: none;
  field-sizing: content;
`;
