import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

export const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'para:scroll-m-20 para:text-4xl para:font-extrabold para:tracking-tight para:lg: para:text-5xl',
      h2: 'para:scroll-m-20 para:border-b para:pb-2 para:text-3xl para:font-semibold para:tracking-tight para:first:mt-0',
      h3: 'para:scroll-m-20 para:text-2xl para:font-semibold para:tracking-tight',
      h4: 'para:scroll-m-20 para:text-xl para:font-semibold para:tracking-tight',
      p: 'para:leading-normal',
    },
    color: {
      default: 'para:text-foreground',
      primary: 'para-text-primary',
      secondary: 'para:text-secondary-foreground',
      destructive: 'para-text-destructive',
      muted: 'para:text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'p',
    color: 'default',
  },
});

function Typography({
  className,
  variant,
  color,
  ...props
}: React.ComponentProps<'p'> & VariantProps<typeof typographyVariants>) {
  const Comp = variant || 'p';
  return <Comp className={cn(typographyVariants({ variant, color, className }))} {...props} />;
}

export { Typography };
