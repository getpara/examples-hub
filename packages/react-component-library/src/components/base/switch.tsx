'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root>;

function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'para:peer para:data-[state=checked]:bg-primary para:data-[state=unchecked]:bg-input para:focus-visible:border-ring para:focus-visible:ring-ring/50 para:inline-flex para:h-5 para:w-9 para:shrink-0 para:items-center para:rounded-full para:border-2 para:border-transparent para:shadow-xs para:transition-all para:outline-none para:focus-visible:ring-[3px] para:disabled:cursor-not-allowed para:disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'para:bg-background para:pointer-events-none para:block para:size-4 para:rounded-full para:ring-0 para:shadow-lg para:transition-transform para:data-[state=checked]:translate-x-4 para:data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch, SwitchProps };
