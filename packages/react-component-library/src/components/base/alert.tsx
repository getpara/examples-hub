import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'para:relative para:w-full para:rounded-lg para:border para:px-4 para:py-3 para:text-sm para:grid para:has-[>svg]:grid-cols-[calc(var(--para-spacing)*4)_1fr] para:grid-cols-[0_1fr] para:has-[>svg]:gap-x-3 para:gap-y-0.5 para:items-start para:[&>svg]:size-4 para:[&>svg]:translate-y-0.5 para:[&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'para:bg-background para:text-foreground para:border-border',
        destructive:
          'para:text-destructive-foreground para:[&>svg]:text-current para:*:data-[slot=alert-description]:text-destructive-foreground/80 para:border-destructive/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('para:col-start-2 para:line-clamp-1 para:min-h-4 para:font-medium para:tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn('para:col-start-2 para:grid para:justify-items-start para:gap-1 para:[&_p]:leading-relaxed', className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
