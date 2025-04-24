import clsx from 'clsx';
import { ComponentProps, forwardRef, ReactNode } from 'react';
import { Input } from './input';

type SlottedInputProps = {
  inputClassName?: string;
  StartSlot?: ReactNode;
  EndSlot?: ReactNode;
} & ComponentProps<'input'>;

export const SlottedInput = forwardRef(
  (
    { className, inputClassName, StartSlot, EndSlot, ...inputProps }: SlottedInputProps,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    return (
      <div
        className={clsx(
          'para:border para:border-border para:flex para:items-center para:gap-2 para:rounded-sm para:bg-muted para:pr-3 para:h-12 para:focus-within:border-ring para:focus-within:ring-ring/50',
          className,
        )}
      >
        {StartSlot}
        <Input {...inputProps} className={clsx('para:border-none para:flex-1 para:h-full', inputClassName)} ref={ref} />
        {EndSlot}
      </div>
    );
  },
);
