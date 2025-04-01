'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'para:bg-primary para:text-primary-foreground para:animate-in para:fade-in-0 para:zoom-in-95 para:data-[state=closed]:animate-out para:data-[state=closed]:fade-out-0 para:data-[state=closed]:zoom-out-95 para:data-[side=bottom]:slide-in-from-top-2 para:data-[side=left]:slide-in-from-right-2 para:data-[side=right]:slide-in-from-left-2 para:data-[side=top]:slide-in-from-bottom-2 para:z-50 para:w-fit para:rounded-md para:px-3 para:py-1.5 para:text-xs para:text-balance',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={
            'para:bg-primary para:fill-primary para:z-50 para:size-2.5 para:translate-y-[calc(-50%_-_2px)] para:rotate-45 para:rounded-[2px]'
          }
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
