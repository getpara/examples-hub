'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'para:data-[state=open]:animate-in para:data-[state=closed]:animate-out para:data-[state=closed]:fade-out-0 para:data-[state=open]:fade-in-0 para:fixed para:inset-0 para:z-50 para:bg-black/80',
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = 'right',
  noOverlay,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
  noOverlay?: boolean;
}) {
  return (
    <SheetPortal>
      {!noOverlay && <SheetOverlay />}
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'para:bg-background para:data-[state=open]:animate-in para:data-[state=closed]:animate-out para:fixed para:z-50 para:flex para:flex-col para:gap-4 para:shadow-lg para:transition para:ease-in-out para:data-[state=closed]:duration-300 para:data-[state=open]:duration-500',
          side === 'right' &&
            'para:data-[state=closed]:slide-out-to-right para:data-[state=open]:slide-in-from-right para:inset-y-0 para:right-0 para:h-full para:w-3/4 para:border-l para:sm:max-w-sm',
          side === 'left' &&
            'para:data-[state=closed]:slide-out-to-left para:data-[state=open]:slide-in-from-left para:inset-y-0 para:left-0 para:h-full para:w-3/4 para:border-r para:sm:max-w-sm',
          side === 'top' &&
            'para:data-[state=closed]:slide-out-to-top para:data-[state=open]:slide-in-from-top para:inset-x-0 para:top-0 para:h-auto para:border-b',
          side === 'bottom' &&
            'para:data-[state=closed]:slide-out-to-bottom para:data-[state=open]:slide-in-from-bottom para:inset-x-0 para:bottom-0 para:h-auto para:border-t',
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          className={
            'para:ring-offset-background para:focus:ring-ring para:data-[state=open]:bg-secondary para:absolute para:top-4 para:right-4 para:rounded-xs para:opacity-70 para:transition-opacity para:hover:opacity-100 para:focus:ring-2 para:focus:ring-offset-2 para:focus:outline-hidden para:disabled:pointer-events-none'
          }
        >
          <XIcon className={'para:size-4'} />
          <span className={'para:sr-only'}>Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="sheet-header" className={cn('para:flex para:flex-col para:gap-1.5 para:p-4', className)} {...props} />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('para:mt-auto para:flex para:flex-col para:gap-2 para:p-4', className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('para:text-foreground para:font-semibold', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('para:text-muted-foreground para:text-sm', className)}
      {...props}
    />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
