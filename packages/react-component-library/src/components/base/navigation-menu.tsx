'use client';

import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        'para:group/navigation-menu para:relative para:flex para:max-w-max para:flex-1 para:items-center para:justify-center',
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        'para:group para:flex para:flex-1 para:list-none para:items-center para:justify-center para:gap-1',
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn('para:relative', className)} {...props} />
  );
}

const navigationMenuTriggerStyle = cva(
  'para:group para:inline-flex para:h-9 para:w-max para:items-center para:justify-center para:rounded-md para:bg-background para:px-4 para:py-2 para:text-sm para:font-medium para:hover:bg-accent para:hover:text-accent-foreground para:focus:bg-accent para:focus:text-accent-foreground para:disabled:pointer-events-none para:disabled:opacity-50 para:data-[state=open]:hover:bg-accent para:data-[state=open]:text-accent-foreground para:data-[state=open]:focus:bg-accent para:data-[state=open]:bg-accent/50 para:ring-ring/10 para:dark:ring-ring/20 para:dark:outline-ring/40 para:outline-ring/50 para:transition-[color,box-shadow] para:focus-visible:ring-4 para:focus-visible:outline-1',
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), 'para:group', className)}
      {...props}
    >
      {children}{' '}
      <ChevronDownIcon
        className={
          'para:relative para:top-[1px] para:ml-1 para:size-3 para:transition para:duration-300 para:group-data-[state=open]:rotate-180'
        }
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        'para:data-[motion^=from-]:animate-in para:data-[motion^=to-]:animate-out para:data-[motion^=from-]:fade-in para:data-[motion^=to-]:fade-out para:data-[motion=from-end]:slide-in-from-right-52 para:data-[motion=from-start]:slide-in-from-left-52 para:data-[motion=to-end]:slide-out-to-right-52 para:data-[motion=to-start]:slide-out-to-left-52 para:top-0 para:left-0 para:w-full para:p-2 para:pr-2.5 para:md:absolute para:md:w-auto',
        'para:group-data-[viewport=false]/navigation-menu:bg-popover para:group-data-[viewport=false]/navigation-menu:text-popover-foreground para:group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in para:group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out para:group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 para:group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 para:group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 para:group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 para:group-data-[viewport=false]/navigation-menu:top-full para:group-data-[viewport=false]/navigation-menu:mt-1.5 para:group-data-[viewport=false]/navigation-menu:overflow-hidden para:group-data-[viewport=false]/navigation-menu:rounded-md para:group-data-[viewport=false]/navigation-menu:border para:group-data-[viewport=false]/navigation-menu:shadow para:group-data-[viewport=false]/navigation-menu:duration-200 para:**:data-[slot=navigation-menu-link]:focus:ring-0 para:**:data-[slot=navigation-menu-link]:focus:outline-none',
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className={cn('para:absolute para:top-full para:left-0 para:isolate para:z-50 para:flex para:justify-center')}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          'para:origin-top-center para:bg-popover para:text-popover-foreground para:data-[state=open]:animate-in para:data-[state=closed]:animate-out para:data-[state=closed]:zoom-out-95 para:data-[state=open]:zoom-in-90 para:relative para:mt-1.5 para:h-[var(--radix-navigation-menu-viewport-height)] para:w-full para:overflow-hidden para:rounded-md para:border para:shadow para:md:w-[var(--radix-navigation-menu-viewport-width)]',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "para:data-[active=true]:focus:bg-accent para:data-[active=true]:hover:bg-accent para:data-[active=true]:bg-accent/50 para:data-[active=true]:text-accent-foreground para:hover:bg-accent para:hover:text-accent-foreground para:focus:bg-accent para:focus:text-accent-foreground para:ring-ring/10 para:dark:ring-ring/20 para:dark:outline-ring/40 para:outline-ring/50 para:[&_svg:not([class*='text-'])]:text-muted-foreground para:flex para:flex-col para:gap-1 para:rounded-sm para:p-2 para:text-sm para:transition-[color,box-shadow] para:focus-visible:ring-4 para:focus-visible:outline-1 para:[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        'para:data-[state=visible]:animate-in para:data-[state=hidden]:animate-out para:data-[state=hidden]:fade-out para:data-[state=visible]:fade-in para:top-full para:z-[1] para:flex para:h-1.5 para:items-end para:justify-center para:overflow-hidden',
        className,
      )}
      {...props}
    >
      <div
        className={
          'para:bg-border para:relative para:top-[60%] para:h-2 para:w-2 para:rotate-45 para:rounded-tl-sm para:shadow-md'
        }
      />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
