import { SlottedTextarea } from '@getpara/react-component-library';
import { ComponentProps, forwardRef } from 'react';
import { CopyButton } from './CopyButton';

type CopyTextareaProps = {
  textareaClassName?: string;
} & ComponentProps<'textarea'>;

export const CopyTextarea = forwardRef(
  ({ className, textareaClassName, ...inputProps }: CopyTextareaProps, ref: React.Ref<HTMLTextAreaElement>) => {
    return (
      <SlottedTextarea
        ref={ref}
        className={className}
        textareaClassName={textareaClassName}
        EndSlot={
          <div>
            <CopyButton value={inputProps.value} />
          </div>
        }
        {...inputProps}
      />
    );
  },
);
