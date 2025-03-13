import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'para:border-input para:placeholder:text-muted-foreground para:focus-visible:border-ring para:focus-visible:ring-ring/50 para:aria-invalid:ring-destructive/20 para:dark:aria-invalid:ring-destructive/40 para:aria-invalid:border-destructive para:flex para:field-sizing-content para:min-h-16 para:w-full para:rounded-md para:border para:bg-transparent para:px-3 para:py-2 para:text-base para:shadow-xs para:transition-[color,box-shadow] para:outline-none para:focus-visible:ring-[3px] para:disabled:cursor-not-allowed para:disabled:opacity-50 para:md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
