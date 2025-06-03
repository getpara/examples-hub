import { SlottedInput } from '@getpara/react-component-library';
import { ComponentProps, forwardRef } from 'react';
import { CopyButton } from './CopyButton';

type CopyInputProps = {
  inputClassName?: string;
} & ComponentProps<'input'>;

export const CopyInput = forwardRef(
  ({ className, inputClassName, ...inputProps }: CopyInputProps, ref: React.Ref<HTMLInputElement>) => {
    return (
      <SlottedInput
        ref={ref}
        className={className}
        inputClassName={inputClassName}
        EndSlot={<CopyButton value={inputProps.value} />}
        {...inputProps}
      />
    );
  },
);
