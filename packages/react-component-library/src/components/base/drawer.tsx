'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@/lib/utils';

function Drawer({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        'para:data-[state=open]:animate-in para:data-[state=closed]:animate-out para:data-[state=closed]:fade-out-0 para:data-[state=open]:fade-in-0 para:fixed para:inset-0 para:z-50 para:bg-linear-180 para:from-black/14 para:to-black/70',

        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  noHandle,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & { noHandle?: boolean }) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'para:group/drawer-content para:bg-background para:fixed para:z-50 para:flex para:h-auto para:flex-col',

          'para:data-[vaul-drawer-direction=top]:inset-x-0 para:data-[vaul-drawer-direction=top]:top-0 para:data-[vaul-drawer-direction=top]:mb-24 para:data-[vaul-drawer-direction=top]:max-h-[80vh] para:data-[vaul-drawer-direction=top]:rounded-b-lg',

          'para:data-[vaul-drawer-direction=bottom]:inset-x-0 para:data-[vaul-drawer-direction=bottom]:bottom-0 para:data-[vaul-drawer-direction=bottom]:mt-24 para:data-[vaul-drawer-direction=bottom]:max-h-[80vh] para:data-[vaul-drawer-direction=bottom]:rounded-t-lg',

          'para:data-[vaul-drawer-direction=right]:inset-y-0 para:data-[vaul-drawer-direction=right]:right-0 para:data-[vaul-drawer-direction=right]:w-3/4 para:data-[vaul-drawer-direction=right]:sm:max-w-sm',

          'para:data-[vaul-drawer-direction=left]:inset-y-0 para:data-[vaul-drawer-direction=left]:left-0 para:data-[vaul-drawer-direction=left]:w-3/4 para:data-[vaul-drawer-direction=left]:sm:max-w-sm',

          className,
        )}
        {...props}
      >
        {!noHandle && (
          <div
            className={
              'para:bg-muted para:mx-auto para:mt-4 para:hidden para:h-2 para:w-[100px] para:shrink-0 para:rounded-full para:group-data-[vaul-drawer-direction=bottom]/drawer-content:block'
            }
          />
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="drawer-header" className={cn('para:flex para:flex-col para:gap-1.5 para:p-4', className)} {...props} />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('para:mt-auto para:flex para:flex-col para:gap-2 para:p-4', className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('para:text-foreground para:font-semibold', className)}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('para:text-muted-foreground para:text-sm', className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
