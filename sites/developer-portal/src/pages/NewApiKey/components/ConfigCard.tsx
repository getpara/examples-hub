import { PropsWithChildren, ReactNode } from 'react';
import { FlatCard } from '../../../components/common';
import { Typography } from '@getpara/react-component-library';

type ConfigCardProps = { title?: string; subtitle?: string; ActionComponent?: ReactNode } & PropsWithChildren;

export const ConfigCard = ({ title, subtitle, ActionComponent, children }: ConfigCardProps) => {
  return (
    <FlatCard>
      <div className="para:flex para:flex-col para:gap-4">
        {(title || subtitle || ActionComponent) && (
          <div className="para:flex para:flex-col para:gap-2">
            {(title || ActionComponent) && (
              <div className="para:flex para:items-center para:justify-between para:gap-2">
                <Typography className="para:text-xl para:font-medium">{title}</Typography>
                {ActionComponent}
              </div>
            )}
            {subtitle && (
              <Typography color="secondary" className="para:text-sm para:font-medium">
                {subtitle}
              </Typography>
            )}
          </div>
        )}
        <div className="para:flex para:flex-col para:md:flex-row para:gap-4">{children}</div>
      </div>
    </FlatCard>
  );
};
