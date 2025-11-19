import { PropsWithChildren, ReactNode } from 'react';
import { Badge, cn, Typography } from '@getpara/react-component-library';

export type ConfigCardContentProps = {
  title?: string;
  subtitle?: string;
  badge?: string;
  ActionComponent?: ReactNode;
  className?: string;
} & PropsWithChildren;

export const ConfigCardContent = ({
  title,
  subtitle,
  ActionComponent,
  children,
  className,
  badge,
}: ConfigCardContentProps) => {
  return (
    <div className="para:flex para:flex-col para:gap-4">
      {(title || subtitle || ActionComponent) && (
        <div className="para:flex para:justify-between para:gap-2 para:items-start">
          <div className="para:flex para:flex-col">
            <div className="para:flex para:items-center para:gap-2">
              <Typography className="para:text-xl para:font-medium">{title}</Typography>
              {badge && <Badge>{badge}</Badge>}
            </div>
            <Typography color="secondary" className="para:text-sm para:font-medium para:whitespace-pre-wrap">
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
