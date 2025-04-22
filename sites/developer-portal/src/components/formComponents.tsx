import {
  FormControl as BaseFormControl,
  FormDescription as BaseFormDescription,
  FormMessage as BaseFormMessage,
} from '@getpara/react-component-library';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';

export const FormControl = ({ children, className }: PropsWithChildren & { className?: string }) => (
  <BaseFormControl className={clsx('para:mt-2 para:mb-2', className)}>{children}</BaseFormControl>
);

export const FormDescription = ({ children, className }: PropsWithChildren & { className?: string }) => (
  <BaseFormDescription className={clsx('para:text-muted-foreground para:text-sm', className)}>
    {children}
  </BaseFormDescription>
);

export const FormMessage = () => <BaseFormMessage className="para:text-xs para:text-destructive" />;
