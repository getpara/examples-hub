import { Input, Popover, PopoverContent, PopoverTrigger } from '@getpara/react-component-library';
import { ComponentProps } from 'react';
import { HexAlphaColorPicker } from 'react-colorful';

type ColorInputProps = {
  value?: string | null;
  onChange: (_?: string | null) => void;
} & ComponentProps<'input'>;

export const ColorInput = ({ value, onChange, ...rest }: ColorInputProps) => {
  if (typeof value !== 'string') {
    return null;
  }

  return (
    <div className="para:flex para:gap-2">
      <Popover>
        <PopoverTrigger disabled={rest.disabled}>
          <div
            className="para:size-12 para:rounded-full para:border para:border-border"
            style={{ backgroundColor: value ?? '#000000' }}
          />
        </PopoverTrigger>
        <PopoverContent className="para:w-auto para:rounded para:p-0" collisionPadding={24}>
          <HexAlphaColorPicker
            className="para:rounded para:[&_.react-colorful\\_\\_saturation]:!rounded-t para:[&_.react-colorful\\_\\_last-control]:!rounded-b"
            color={value ?? '#000000'}
            onChange={onChange}
          />
        </PopoverContent>
      </Popover>
      <Input
        {...rest}
        maxLength={9}
        value={value ?? ''}
        placeholder="#000000"
        onChange={ev => {
          let newVal = ev.target.value;
          if (newVal && !newVal.startsWith('#')) {
            newVal = `#${newVal}`;
          }
          onChange(newVal);
        }}
      />
    </div>
  );
};
