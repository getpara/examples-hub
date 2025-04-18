import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Loader } from './loader';

const buttonVariants = cva(
  'para:inline-flex para:items-center para:justify-center para:gap-2 para:whitespace-nowrap para:rounded-md para:text-sm para:font-medium para:transition-[color,box-shadow] para:disabled:pointer-events-none para:disabled:opacity-50 para:[&_svg]:pointer-events-none para:[&_svg:not([class*=size-])]:size-4 para:[&_svg]:shrink-0 para:outline-none para:focus-visible:border-ring para:focus-visible:ring-ring/50 para:focus-visible:ring-[3px] para:aria-invalid:ring-destructive/20 para:dark:aria-invalid:ring-destructive/40 para:aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default: 'para:bg-primary para:text-primary-foreground para:hover:bg-primary/90',
        destructive:
          'para:bg-destructive para:text-white para:hover:bg-destructive/90 para:focus-visible:ring-destructive/20 para:dark:focus-visible:ring-destructive/40',
        outline: 'para:border para:border-input para:bg-background para:hover:bg-muted para:hover:text-accent-foreground',
        secondary: 'para:bg-secondary para:text-secondary-foreground para:hover:bg-secondary/80',
        ghost: 'para:hover:bg-muted para:hover:text-accent-foreground',
        link: 'para:text-primary para:underline-offset-4 para:hover:underline',
        neutral: 'para:bg-foreground para:text-primary-foreground para:hover:bg-foreground/90',
      },
      size: {
        default: 'para:h-9 para:px-4 para:py-2 para:has-[>svg]:px-3',
        sm: 'para:h-8 para:rounded-md para:gap-1.5 para:px-3 para:has-[>svg]:px-2.5 para:text-xs',
        lg: 'para:h-10 para:rounded-md para:px-6 para:has-[>svg]:px-4',
        icon: 'para:size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(function Button(
  {
    className,
    variant,
    size,
    asChild = false,
    isLoading = false,
    ...props
  }: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
      isLoading?: boolean;
    },
  ref: React.Ref<HTMLButtonElement>,
) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} type="button" {...props} ref={ref}>
      <>
        {isLoading && <Loader className="para:stroke-current" />}
        {props.children}
      </>
    </Comp>
  );
});

export { Button, buttonVariants };
