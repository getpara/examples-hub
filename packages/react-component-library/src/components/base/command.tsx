import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => {
  return (
    <CommandPrimitive
      ref={ref}
      data-slot="command"
      className={cn(
        'para:bg-popover para:text-popover-foreground para:flex para:h-full para:w-full para:flex-col para:overflow-hidden para:rounded-md',
        className,
      )}
      {...props}
    />
  );
});

function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="para:sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="para:overflow-hidden para:p-0">
        <Command className="para:[&_[cmdk-group-heading]]:text-muted-foreground para:**:data-[slot=command-input-wrapper]:h-12 para:[&_[cmdk-group-heading]]:px-2 para:[&_[cmdk-group-heading]]:font-medium para:[&_[cmdk-group]]:px-2 para:[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 para:[&_[cmdk-input-wrapper]_svg]:h-5 para:[&_[cmdk-input-wrapper]_svg]:w-5 para:[&_[cmdk-input]]:h-12 para:[&_[cmdk-item]]:px-2 para:[&_[cmdk-item]]:py-3 para:[&_[cmdk-item]_svg]:h-5 para:[&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="para:flex para:h-9 para:items-center para:gap-2 para:border-b para:px-3"
    >
      <SearchIcon className="para:size-4 para:shrink-0 para:opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'para:placeholder:text-muted-foreground para:flex para:h-10 para:w-full para:rounded-md para:bg-transparent para:py-3 para:text-sm para:outline-hidden para:disabled:cursor-not-allowed para:disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn('para:max-h-[300px] para:scroll-py-1 para:overflow-x-hidden para:overflow-y-auto', className)}
      {...props}
    />
  );
}

function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className="para:py-6 para:text-center para:text-sm" {...props} />;
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'para:text-foreground para:[&_[cmdk-group-heading]]:text-muted-foreground para:overflow-hidden para:p-1 para:[&_[cmdk-group-heading]]:px-2 para:[&_[cmdk-group-heading]]:py-1.5 para:[&_[cmdk-group-heading]]:text-xs para:[&_[cmdk-group-heading]]:font-medium',
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('para:bg-border para:-mx-1 para:h-px', className)}
      {...props}
    />
  );
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "para:data-[selected=true]:bg-accent para:data-[selected=true]:text-accent-foreground para:[&_svg:not([class*='text-'])]:text-muted-foreground para:relative para:flex para:cursor-default para:items-center para:gap-2 para:rounded-sm para:px-2 para:py-1.5 para:text-sm para:outline-hidden para:select-none para:data-[disabled=true]:pointer-events-none para:data-[disabled=true]:opacity-50 para:[&_svg]:pointer-events-none para:[&_svg]:shrink-0 para:[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn('para:text-muted-foreground para:ml-auto para:text-xs para:tracking-widest', className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
