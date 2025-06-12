import { Typography } from '@getpara/react-component-library';
import { ReactNode } from 'react';

type PageHeader = {
  title: string;
  subtitle?: ReactNode;
  ActionComponent?: ReactNode;
};

export const PageHeader = ({ title, subtitle, ActionComponent }: PageHeader) => {
  return (
    <div className="para:flex para:flex-col para:min-w-0">
      <div className="para:flex para:justify-between para:items-center para:flex-wrap para:gap-2">
        <Typography className="para:text-2xl para:font-semibold">{title}</Typography>
        {ActionComponent}
      </div>
      {subtitle && (
        <Typography color="secondary" className="para:text-sm para:font-medium para:mt-2 para:break-words">
          {subtitle}
        </Typography>
      )}
    </div>
  );
};
