import clsx from 'clsx';
import { ComponentProps, forwardRef, ReactNode, useState } from 'react';
import { Textarea } from './textarea';

type SlottedTextareaProps = {
  textareaClassName?: string;
  StartSlot?: ReactNode;
  EndSlot?: ReactNode;
} & ComponentProps<'textarea'>;

export const SlottedTextarea = forwardRef(
  (
    { className, textareaClassName, StartSlot, EndSlot, ...inputProps }: SlottedTextareaProps,
    ref: React.Ref<HTMLTextAreaElement>,
  ) => {
    const [focused, setFocused] = useState(false);

    return (
      <div
        className={clsx(
          'para:border para:border-border para:flex para:gap-2 para:rounded-sm para:bg-muted para:pr-3 para:min-h-11',
          focused && 'para:border-ring para:ring-ring/50',
          className,
        )}
      >
        {StartSlot && <div className="para:py-2">{StartSlot}</div>}
        <Textarea
          {...inputProps}
          className={clsx('para:border-none para:flex-1', textareaClassName)}
          ref={ref}
          onFocus={e => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
        />
        {EndSlot && <div className="para:py-2">{EndSlot}</div>}
      </div>
    );
  },
);
