'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn('para:flex para:flex-col para:gap-2', className)} {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'para:bg-muted para:text-muted-foreground para:inline-flex para:h-9 para:w-fit para:items-center para:justify-center para:rounded-md para:p-1',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "para:data-[state=active]:bg-background para:data-[state=active]:text-foreground para:focus-visible:border-ring para:focus-visible:ring-ring/50 para:focus-visible:outline-ring para:inline-flex para:flex-1 para:items-center para:justify-center para:gap-1.5 para:rounded-md para:px-2 para:py-1 para:text-sm para:font-medium para:whitespace-nowrap para:transition-[color,box-shadow] para:focus-visible:ring-[3px] para:focus-visible:outline-1 para:disabled:pointer-events-none para:disabled:opacity-50 para:[&_svg]:pointer-events-none para:[&_svg]:shrink-0 para:[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content data-slot="tabs-content" className={cn('para:flex-1 para:outline-none', className)} {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
