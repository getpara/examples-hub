'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'para:peer para:border-input para:data-[state=checked]:bg-primary para:data-[state=checked]:text-primary-foreground para:data-[state=checked]:border-primary para:focus-visible:border-ring para:focus-visible:ring-ring/50 para:aria-invalid:ring-destructive/20 para:dark:aria-invalid:ring-destructive/40 para:aria-invalid:border-destructive para:size-4 para:shrink-0 para:rounded-[4px] para:border para:shadow-xs para:transition-shadow para:outline-none para:focus-visible:ring-[3px] para:disabled:cursor-not-allowed para:disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={'para:flex para:items-center para:justify-center para:text-current para:transition-none'}
      >
        <CheckIcon className={'para:size-3.5'} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
