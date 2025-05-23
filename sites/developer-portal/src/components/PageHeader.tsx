import { Typography } from '@getpara/react-component-library';
import { ReactNode } from 'react';

type PageHeader = {
  title: string;
  subtitle?: string;
  ActionComponent?: ReactNode;
};

export const PageHeader = ({ title, subtitle, ActionComponent }: PageHeader) => {
  return (
    <div className="para:flex para:flex-col">
      <div className="para:flex para:justify-between para:items-center">
        <Typography className="para:text-2xl para:font-semibold">{title}</Typography>
        {ActionComponent}
      </div>
      {subtitle && (
        <Typography color="secondary" className="para:text-sm para:font-medium para:mt-2">
          {subtitle}
        </Typography>
      )}
    </div>
  );
};
