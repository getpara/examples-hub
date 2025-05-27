import { cn, Loader, Typography } from '@getpara/react-component-library';
import { FlatCard } from './common';
import { LucideIcon } from 'lucide-react';

type OverviewCardProps = {
  title: string;
  Icon: LucideIcon;
  value?: string;
  valueLabel?: string;
  changeValue?: number;
  isLoading?: boolean;
  className?: string;
};

export const OverviewCard = ({
  title,
  Icon,
  valueLabel,
  changeValue = 0,
  value,
  isLoading,
  className,
}: OverviewCardProps) => {
  return (
    <FlatCard className={cn('para:p-6 para:gap-2 para:w-[290px]', className)}>
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
            {valueLabel && (
              <Typography
                className={cn('para:text-xs para:text-muted-foreground', {
                  'para:text-destructive': changeValue < 0,
                  'para:text-emerald-600': changeValue > 0,
                })}
              >
                {valueLabel}
              </Typography>
            )}
          </>
        )}
      </div>
    </FlatCard>
  );
};
