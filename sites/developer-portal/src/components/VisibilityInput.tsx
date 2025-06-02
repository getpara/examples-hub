import { useCopyToClipboard } from '@getpara/react-common';
import { Button, SlottedInput } from '@getpara/react-component-library';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { ComponentProps, forwardRef, useState } from 'react';

type VisibilityInputProps = {
  inputClassName?: string;
  showCopyButton?: boolean;
  defaultVisible?: boolean;
} & ComponentProps<'input'>;

export const VisibilityInput = forwardRef(
  (
    { className, inputClassName, showCopyButton, defaultVisible, ...inputProps }: VisibilityInputProps,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const [isVisible, setIsVisible] = useState(defaultVisible ? true : false);
    const [isCopied, copy] = useCopyToClipboard();

    const handleVisibilityChange = () => {
      setIsVisible(curr => !curr);
    };

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
          <>
            <Button
              variant="ghost"
              className="para:h-full para:p-0 para:has-[>svg]:px-0 para:[&_svg]:stroke-muted-foreground para:hover:[&_svg]:stroke-foreground"
              onClick={handleVisibilityChange}
            >
              {isVisible ? <EyeOff /> : <Eye />}
            </Button>
            {showCopyButton && (
              <Button
                variant="ghost"
                className="para:h-full para:p-0 para:has-[>svg]:px-0 para:[&_svg]:stroke-muted-foreground para:hover:[&_svg]:stroke-foreground"
                onClick={handleCopy}
              >
                {isCopied ? <Check /> : <Copy />}
              </Button>
            )}
          </>
        }
        {...inputProps}
        type={isVisible ? 'text' : 'password'}
      />
    );
  },
);
