'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { MinusIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn('para:flex para:items-center para:gap-2 para:has-disabled:opacity-50', containerClassName)}
      className={cn('para:disabled:cursor-not-allowed', className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="input-otp-group" className={cn('para:flex para:items-center', className)} {...props} />;
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'para:border-input para:data-[active=true]:border-ring para:data-[active=true]:ring-ring/50 para:data-[active=true]:aria-invalid:ring-destructive/20 para:dark:data-[active=true]:aria-invalid:ring-destructive/40 para:aria-invalid:border-destructive para:data-[active=true]:aria-invalid:border-destructive para:relative para:flex para:h-9 para:w-9 para:items-center para:justify-center para:border-y para:border-r para:text-sm para:shadow-xs para:transition-all para:outline-none para:first:rounded-l-md para:first:border-l para:last:rounded-r-md para:data-[active=true]:z-10 para:data-[active=true]:ring-[3px]',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div
          className={'para:pointer-events-none para:absolute para:inset-0 para:flex para:items-center para:justify-center'}
        >
          <div className={'para:animate-caret-blink para:bg-foreground para:h-4 para:w-px para:duration-1000'} />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
