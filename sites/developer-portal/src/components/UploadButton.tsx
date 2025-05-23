import { Button, cn, Input, Loader, Typography } from '@getpara/react-component-library';
import { CircleAlert, Plus } from 'lucide-react';
import { ChangeEvent, ComponentProps } from 'react';

type UploadButtonProps = {
  idPrefix: string;
  value?: string | null;
  isLoading?: boolean;
  error?: boolean;
  buttonClassName?: string;
  onInputChange: (_: ChangeEvent<HTMLInputElement>) => void;
} & ComponentProps<'input'>;

export const UploadButton = ({
  idPrefix,
  value,
  isLoading,
  error,
  buttonClassName,
  onInputChange,
  ...rest
}: UploadButtonProps) => {
  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        disabled={rest.disabled || isLoading}
        onClick={() => {
          document.getElementById(`${idPrefix}-input`)?.click();
        }}
        className={cn(
          'para:relative para:p-0 para:overflow-hidden para:h-[80px] para:w-[80px] para:flex para:items-center para:justify-center para:border para:border-dashed para:border-border para:bg-muted para:disabled:opacity-100',
          {
            'para:border-solid': !!value,
          },
          buttonClassName,
        )}
      >
        {value && (
          <div className="para:size-full para:absolute para:hover:bg-black/50 para:hover:[&>p]:visible para:flex para:items-center para:justify-center">
            <Typography className="para:text-xs para:font-medium para:text-white para:invisible">Edit</Typography>
          </div>
        )}
        {isLoading ? (
          <Loader className="para:stroke-foreground para:size-6" />
        ) : error ? (
          <CircleAlert className="para:stroke-destructive para:size-6" />
        ) : value ? (
          <img src={value} className="para:size-full para:object-contain" />
        ) : (
          <div className="para:flex para:flex-col para:gap-0.5 para:items-center para:justify-center">
            <Plus className="para:stroke-foreground para:size-6" />
            <Typography className="para:text-xs para:font-medium">Upload</Typography>
          </div>
        )}
      </Button>
      <Input
        {...rest}
        id={`${idPrefix}-input`}
        className="para:hidden"
        value=""
        onChange={onInputChange}
        type="file"
        accept="image/jpg,image/jpeg,image/png,image/gif"
      />
    </div>
  );
};
