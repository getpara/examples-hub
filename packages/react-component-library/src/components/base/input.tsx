import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef(function Input(
  { className, type, ...props }: React.ComponentProps<'input'>,
  ref: React.Ref<HTMLInputElement>,
) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'para:border-border para:file:text-foreground para:placeholder:text-muted-foreground para:selection:bg-primary para:selection:text-primary-foreground para:flex para:h-11 para:w-full para:min-w-0 para:rounded-md para:border para:bg-muted para:px-3 para:py-1 para:text-base para:transition-[color,box-shadow] para:outline-none para:file:inline-flex para:file:h-7 para:file:border-0 para:file:bg-transparent para:file:text-sm para:file:font-medium para:disabled:pointer-events-none para:disabled:cursor-not-allowed para:disabled:opacity-50 para:md:text-sm',
        'para:focus-visible:border-ring para:focus-visible:ring-ring/50',
        'para:aria-invalid:ring-destructive/20 para:dark:aria-invalid:ring-destructive/40 para:aria-invalid:border-destructive',
        className,
      )}
      {...props}
      ref={ref}
    />
  );
});

export { Input };
