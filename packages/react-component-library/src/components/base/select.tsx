'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "para:border-input para:data-[placeholder]:text-muted-foreground para:[&_svg:not([class*='text-'])]:text-muted-foreground para:focus-visible:border-ring para:focus-visible:ring-ring/50 para:aria-invalid:ring-destructive/20 para:dark:aria-invalid:ring-destructive/40 para:aria-invalid:border-destructive para:flex para:h-9 para:w-fit para:items-center para:justify-between para:gap-2 para:rounded-md para:border para:bg-transparent para:px-3 para:py-2 para:text-sm para:whitespace-nowrap para:shadow-xs para:transition-[color,box-shadow] para:outline-none para:focus-visible:ring-[3px] para:disabled:cursor-not-allowed para:disabled:opacity-50 para:*:data-[slot=select-value]:line-clamp-1 para:*:data-[slot=select-value]:flex para:*:data-[slot=select-value]:items-center para:*:data-[slot=select-value]:gap-2 para:[&_svg]:pointer-events-none para:[&_svg]:shrink-0 para:[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className={'para:size-4 para:opacity-50'} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          'para:bg-popover para:text-popover-foreground para:data-[state=open]:animate-in para:data-[state=closed]:animate-out para:data-[state=closed]:fade-out-0 para:data-[state=open]:fade-in-0 para:data-[state=closed]:zoom-out-95 para:data-[state=open]:zoom-in-95 para:data-[side=bottom]:slide-in-from-top-2 para:data-[side=left]:slide-in-from-right-2 para:data-[side=right]:slide-in-from-left-2 para:data-[side=top]:slide-in-from-bottom-2 para:relative para:z-50 para:max-h-96 para:min-w-[8rem] para:overflow-hidden para:rounded-md para:border para:shadow-md',
          position === 'popper' &&
            'para:data-[side=bottom]:translate-y-1 para:data-[side=left]:-translate-x-1 para:data-[side=right]:translate-x-1 para:data-[side=top]:-translate-y-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'para:p-1',
            position === 'popper' &&
              'para:h-[var(--radix-select-trigger-height)] para:w-full para:min-w-[var(--radix-select-trigger-width)] para:scroll-my-1',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn('para:px-2 para:py-1.5 para:text-sm para:font-medium', className)}
      {...props}
    />
  );
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "para:focus:bg-accent para:focus:text-accent-foreground para:[&_svg:not([class*='text-'])]:text-muted-foreground para:relative para:flex para:w-full para:cursor-default para:items-center para:gap-2 para:rounded-sm para:py-1.5 para:pr-8 para:pl-2 para:text-sm para:outline-hidden para:select-none para:data-[disabled]:pointer-events-none para:data-[disabled]:opacity-50 para:[&_svg]:pointer-events-none para:[&_svg]:shrink-0 para:[&_svg:not([class*='size-'])]:size-4 para:*:[span]:last:flex para:*:[span]:last:items-center para:*:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className={'para:absolute para:right-2 para:flex para:size-3.5 para:items-center para:justify-center'}>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className={'para:size-4'} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('para:bg-border para:pointer-events-none para:-mx-1 para:my-1 para:h-px', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn('para:flex para:cursor-default para:items-center para:justify-center para:py-1', className)}
      {...props}
    >
      <ChevronUpIcon className={'para:size-4'} />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn('para:flex para:cursor-default para:items-center para:justify-center para:py-1', className)}
      {...props}
    >
      <ChevronDownIcon className={'para:size-4'} />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
