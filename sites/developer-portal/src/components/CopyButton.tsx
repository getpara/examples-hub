import { useCopyToClipboard } from '@getpara/react-common';
import { Button, cn } from '@getpara/react-component-library';
import { Check, Copy } from 'lucide-react';

type CopyButtonProps = {
  value?: string | number | readonly string[];
  className?: string;
};

export const CopyButton = ({ value, className }: CopyButtonProps) => {
  const [isCopied, copy] = useCopyToClipboard();

  const handleCopy = () => {
    if (value) {
      copy(value.toString());
    }
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        'para:h-full para:p-0 para:has-[>svg]:px-0 para:[&_svg]:stroke-muted-foreground para:hover:[&_svg]:stroke-foreground',
        className,
      )}
      onClick={handleCopy}
    >
      {isCopied ? <Check /> : <Copy />}
    </Button>
  );
};
