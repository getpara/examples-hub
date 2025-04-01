'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'para:bg-popover para:text-popover-foreground para:data-[state=open]:animate-in para:data-[state=closed]:animate-out para:data-[state=closed]:fade-out-0 para:data-[state=open]:fade-in-0 para:data-[state=closed]:zoom-out-95 para:data-[state=open]:zoom-in-95 para:data-[side=bottom]:slide-in-from-top-2 para:data-[side=left]:slide-in-from-right-2 para:data-[side=right]:slide-in-from-left-2 para:data-[side=top]:slide-in-from-bottom-2 para:z-50 para:w-72 para:rounded-md para:border para:p-4 para:shadow-md para:outline-hidden',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
