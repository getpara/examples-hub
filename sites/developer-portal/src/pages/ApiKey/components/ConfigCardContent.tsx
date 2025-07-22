import { PropsWithChildren, ReactNode } from 'react';
import { cn, Typography } from '@getpara/react-component-library';

export type ConfigCardContentProps = {
  title?: string;
  subtitle?: string;
  ActionComponent?: ReactNode;
  className?: string;
} & PropsWithChildren;

export const ConfigCardContent = ({ title, subtitle, ActionComponent, children, className }: ConfigCardContentProps) => {
  return (
    <div className="para:flex para:flex-col para:gap-4">
      {(title || subtitle || ActionComponent) && (
        <div className="para:flex para:justify-between para:gap-2 para:items-start">
          <div className="para:flex para:flex-col">
            <Typography className="para:text-xl para:font-medium">{title}</Typography>
            <Typography color="secondary" className="para:text-sm para:font-medium">
              {subtitle}
            </Typography>
          </div>
          {ActionComponent}
        </div>
      )}
      <div className={cn('para:flex para:flex-col para:md:flex-row para:gap-4', className)}>{children}</div>
    </div>
  );
};
