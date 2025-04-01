'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '@/lib/utils';

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'para:flex para:items-center para:gap-2 para:text-sm para:leading-none para:font-medium para:select-none para:group-data-[disabled=true]:pointer-events-none para:group-data-[disabled=true]:opacity-50 para:peer-disabled:cursor-not-allowed para:peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
