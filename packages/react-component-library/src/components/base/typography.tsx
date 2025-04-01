import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

export const typographyVariants = cva('para:text-base', {
  variants: {
    variant: {
      h1: 'para:scroll-m-20 para:text-4xl para:font-extrabold para:tracking-tight para:lg: para:text-5xl',
      h2: 'para:scroll-m-20 para:border-b para:pb-2 para:text-3xl para:font-semibold para:tracking-tight para:first:mt-0',
      h3: 'para:scroll-m-20 para:text-2xl para:font-semibold para:tracking-tight',
      h4: 'para:scroll-m-20 para:text-xl para:font-semibold para:tracking-tight',
      p: 'para:leading-7',
    },
    affects: {
      default: '',
      lead: 'para:text-xl para:text-muted-foreground',
      large: 'para:text-lg para:font-semibold',
      small: 'para:text-sm para:font-medium para:leading-none',
      muted: 'para:text-sm para:text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'p',
    affects: 'default',
  },
});

function Typography({
  className,
  variant,
  affects,
  ...props
}: React.ComponentProps<'p'> & VariantProps<typeof typographyVariants>) {
  const Comp = variant || 'p';
  return <Comp className={cn(typographyVariants({ variant, affects, className }))} {...props} />;
}

export { Typography };
