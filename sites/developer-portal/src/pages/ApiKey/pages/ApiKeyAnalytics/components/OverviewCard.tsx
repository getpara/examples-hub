import { Loader, Typography } from '@getpara/react-component-library';
import { FlatCard } from '../../../../../components/common';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

type OverviewCardProps = {
  title: string;
  Icon: LucideIcon;
  value?: string;
  change: {
    label: string;
    value: number;
  };
  isLoading?: boolean;
};

export const OverviewCard = ({ title, Icon, change, value, isLoading }: OverviewCardProps) => {
  return (
    <FlatCard className="para:p-6 para:gap-2 para:w-[290px]">
      <div className="para:flex para:justify-between para:items-center">
        <Typography className="para:text-sm para:font-medium para:text-card-foreground">{title}</Typography>
        <Icon className="para:size-4" />
      </div>
      <div className="flex-1 para:min-h-12">
        {isLoading ? (
          <div className="para:flex para:items-center para:h-full">
            <Loader className="para:size-10 para:mx-auto" />
          </div>
        ) : (
          <>
            <Typography className="para:text-2xl para:font-bold para:text-card-foreground">{value ?? 'No Data'}</Typography>
            <Typography
              className={clsx('para:text-xs para:text-emerald-600', {
                'para:text-destructive': change.value < 0,
              })}
            >
              {change.label}
            </Typography>
          </>
        )}
      </div>
    </FlatCard>
  );
};
