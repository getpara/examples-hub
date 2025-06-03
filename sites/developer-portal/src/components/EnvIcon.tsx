import { Environment } from '../types/environment';
import { cn } from '@getpara/react-component-library';

export const EnvIcon = ({
  children,
  className,
  environment,
  ...rest
}: React.ComponentProps<'span'> & { environment: Environment }) => (
  <span
    className={cn(
      'para:size-2 para:rounded-full para:bg-amber-500',
      {
        'para:bg-emerald-500': environment === Environment.PROD,
      },
      className,
    )}
    {...rest}
  >
    {children}
  </span>
);
