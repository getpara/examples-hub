import { useCopyToClipboard } from '@getpara/react-common';
import { Button, SlottedInput } from '@getpara/react-component-library';
import { Check, Copy } from 'lucide-react';
import { ComponentProps, forwardRef } from 'react';

type CopyInputProps = {
  inputClassName?: string;
} & ComponentProps<'input'>;

export const CopyInput = forwardRef(
  ({ className, inputClassName, ...inputProps }: CopyInputProps, ref: React.Ref<HTMLInputElement>) => {
    const [isCopied, copy] = useCopyToClipboard();

    const handleCopy = () => {
      if (inputProps.value) {
        copy(inputProps.value?.toString());
      }
    };

    return (
      <SlottedInput
        ref={ref}
        className={className}
        inputClassName={inputClassName}
        EndSlot={
          <Button
            variant="ghost"
            className="para:h-full para:p-0 para:has-[>svg]:px-0 para:[&_svg]:stroke-muted-foreground para:hover:[&_svg]:stroke-foreground"
            onClick={handleCopy}
          >
            {isCopied ? <Check /> : <Copy />}
          </Button>
        }
        {...inputProps}
      />
    );
  },
);
