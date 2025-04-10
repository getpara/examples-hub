'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn(
        'para:focus-visible:border-ring para:focus-visible:ring-ring/50 para:focus-visible:ring-[3px] para:outline-none',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          'para:border-border para:bg-popover para:text-popover-foreground para:data-[state=open]:animate-in para:data-[state=closed]:animate-out para:data-[state=closed]:fade-out-0 para:data-[state=open]:fade-in-0 para:data-[state=closed]:zoom-out-95 para:data-[state=open]:zoom-in-95 para:data-[side=bottom]:slide-in-from-top-2 para:data-[side=left]:slide-in-from-right-2 para:data-[side=right]:slide-in-from-left-2 para:data-[side=top]:slide-in-from-bottom-2 para:z-50 para:max-h-(--radix-dropdown-menu-content-available-height) para:min-w-[8rem] para:overflow-x-hidden para:overflow-y-auto para:rounded-md para:border para:p-1 para:shadow-md',

          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "para:focus:bg-accent para:focus:text-accent-foreground para:data-[variant=destructive]:text-destructive-foreground para:data-[variant=destructive]:focus:bg-destructive/10 para:dark:data-[variant=destructive]:focus:bg-destructive/40 para:data-[variant=destructive]:focus:text-destructive-foreground para:data-[variant=destructive]:*:[svg]:!text-destructive-foreground para:[&_svg:not([class*='text-'])]:text-muted-foreground para:relative para:flex para:cursor-default para:items-center para:gap-2 para:rounded-sm para:px-2 para:py-1.5 para:text-sm para:outline-hidden para:select-none para:data-[disabled]:pointer-events-none para:data-[disabled]:opacity-50 para:data-[inset]:pl-8 para:[&_svg]:pointer-events-none para:[&_svg]:shrink-0 para:[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "para:focus:bg-accent para:focus:text-accent-foreground para:relative para:flex para:cursor-default para:items-center para:gap-2 para:rounded-sm para:py-1.5 para:pr-2 para:pl-8 para:text-sm para:outline-hidden para:select-none para:data-[disabled]:pointer-events-none para:data-[disabled]:opacity-50 para:[&_svg]:pointer-events-none para:[&_svg]:shrink-0 para:[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span
        className={
          'para:pointer-events-none para:absolute para:left-2 para:flex para:size-3.5 para:items-center para:justify-center'
        }
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className={'para:size-4'} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "para:focus:bg-accent para:focus:text-accent-foreground para:relative para:flex para:cursor-default para:items-center para:gap-2 para:rounded-sm para:py-1.5 para:pr-2 para:pl-8 para:text-sm para:outline-hidden para:select-none para:data-[disabled]:pointer-events-none para:data-[disabled]:opacity-50 para:[&_svg]:pointer-events-none para:[&_svg]:shrink-0 para:[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span
        className={
          'para:pointer-events-none para:absolute para:left-2 para:flex para:size-3.5 para:items-center para:justify-center'
        }
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className={'para:size-2 para:fill-current'} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn('para:px-2 para:py-1.5 para:text-sm para:font-medium para:data-[inset]:pl-8', className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('para:bg-border para:-mx-1 para:my-1 para:h-px', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn('para:text-muted-foreground para:ml-auto para:text-xs para:tracking-widest', className)}
      {...props}
    />
  );
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        'para:focus:bg-accent para:focus:text-accent-foreground para:data-[state=open]:bg-accent para:data-[state=open]:text-accent-foreground para:flex para:cursor-default para:items-center para:rounded-sm para:px-2 para:py-1.5 para:text-sm para:outline-hidden para:select-none para:data-[inset]:pl-8',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className={'para:ml-auto para:size-4'} />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        'para:bg-popover para:text-popover-foreground para:data-[state=open]:animate-in para:data-[state=closed]:animate-out para:data-[state=closed]:fade-out-0 para:data-[state=open]:fade-in-0 para:data-[state=closed]:zoom-out-95 para:data-[state=open]:zoom-in-95 para:data-[side=bottom]:slide-in-from-top-2 para:data-[side=left]:slide-in-from-right-2 para:data-[side=right]:slide-in-from-left-2 para:data-[side=top]:slide-in-from-bottom-2 para:z-50 para:min-w-[8rem] para:overflow-hidden para:rounded-md para:border para:p-1 para:shadow-lg',
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
