'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn('para:grid para:gap-3', className)} {...props} />;
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'para:border-primary para:text-primary para:focus-visible:border-ring para:focus-visible:ring-ring/50 para:aria-invalid:ring-destructive/20 para:dark:aria-invalid:ring-destructive/40 para:aria-invalid:border-destructive para:aspect-square para:size-4 para:shrink-0 para:rounded-full para:border para:shadow-xs para:transition-[color,box-shadow] para:outline-none para:focus-visible:ring-[3px] para:disabled:cursor-not-allowed para:disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className={'para:relative para:flex para:items-center para:justify-center'}
      >
        <CircleIcon
          className={
            'para:fill-primary para:absolute para:top-1/2 para:left-1/2 para:size-3.5 para:-translate-x-1/2 para:-translate-y-1/2'
          }
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
