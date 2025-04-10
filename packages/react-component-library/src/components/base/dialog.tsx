'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

const DialogOverlay = React.forwardRef(function DialogOverlay(
  { className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'para:data-[state=open]:animate-in para:data-[state=closed]:animate-out para:data-[state=closed]:fade-out-0 para:data-[state=open]:fade-in-0 para:fixed para:inset-0 para:z-50 para:bg-black/80',
        className,
      )}
      {...props}
      ref={ref}
    />
  );
});

function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'para:bg-background para:data-[state=open]:animate-in para:data-[state=closed]:animate-out para:data-[state=closed]:fade-out-0 para:data-[state=open]:fade-in-0 para:data-[state=closed]:zoom-out-95 para:data-[state=open]:zoom-in-95 para:fixed para:top-[50%] para:left-[50%] para:z-50 para:grid para:w-full para:max-w-[calc(100%-2rem)] para:translate-x-[-50%] para:translate-y-[-50%] para:gap-4 para:rounded-lg para:border para:p-6 para:shadow-lg para:duration-200 para:sm:max-w-lg',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="para:ring-offset-background para:focus:ring-ring para:data-[state=open]:bg-accent para:data-[state=open]:text-muted-foreground para:absolute para:top-4 para:right-4 para:rounded-xs para:opacity-70 para:transition-opacity para:hover:opacity-100 para:focus:ring-2 para:focus:ring-offset-2 para:focus:outline-hidden para:disabled:pointer-events-none para:[&_svg]:pointer-events-none para:[&_svg]:shrink-0 para:[&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="para:sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('para:flex para:flex-col para:gap-2 para:text-center para:sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('para:flex para:flex-col-reverse para:gap-2 para:sm:flex-row para:sm:justify-end', className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('para:text-lg para:leading-none para:font-semibold', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('para:text-muted-foreground para:text-sm', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
