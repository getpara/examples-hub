import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'para:inline-flex para:items-center para:justify-center para:rounded-sm para:border para:px-2 para:py-0.5 para:text-xs para:font-medium para:w-fit para:whitespace-nowrap para:shrink-0 para:[&>svg]:size-3 para:gap-1 para:[&>svg]:pointer-events-none para:focus-visible:border-ring para:focus-visible:ring-ring/50 para:focus-visible:ring-[3px] para:aria-invalid:ring-destructive/20 para:dark:aria-invalid:ring-destructive/40 para:aria-invalid:border-destructive para:transition-[color,box-shadow] para:overflow-hidden',
  {
    variants: {
      variant: {
        default: 'para:border-transparent para:bg-primary para:text-primary-foreground para:[a&]:hover:bg-primary/90',
        secondary:
          'para:border-transparent para:bg-secondary para:text-secondary-foreground para:[a&]:hover:bg-secondary/90',
        destructive:
          'para:border-transparent para:bg-destructive para:text-white para:[a&]:hover:bg-destructive/90 para:focus-visible:ring-destructive/20 para:dark:focus-visible:ring-destructive/40',
        outline: 'para:text-foreground para:[a&]:hover:bg-accent para:[a&]:hover:text-accent-foreground',
        neutral: 'para:bg-foreground para:text-primary-foreground para:hover:bg-foreground/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
