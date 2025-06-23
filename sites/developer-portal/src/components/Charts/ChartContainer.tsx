import { ChartConfig, ChartContainer as BaseChartContainer, Typography, Loader, cn } from '@getpara/react-component-library';
import { ResponsiveContainer } from 'recharts';
import { FlatCard } from '../FlatCard';
import { ReactNode } from 'react';

type ChartContainerProps = {
  title: string;
  fullWidth?: boolean;
  chartConfig: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>['children'];
  RightContent?: ReactNode;
  isLoading?: boolean;
  noData?: boolean;
};

export const ChartContainer = ({
  title,
  chartConfig,
  children,
  fullWidth,
  RightContent,
  isLoading,
  noData,
}: ChartContainerProps) => {
  return (
    <FlatCard className="para:p-0 para:lg:p-0 para:pb-[26px] para:pt-6 para:lg:pb-[26px] para:lg:pt-6 para:gap-[22px] para:flex-1 para:max-h-none para:md:max-h-[340px]">
      <div>
        <Typography className="para:pl-6 para:text-sm para:font-medium">{title}</Typography>
      </div>
      {isLoading || noData ? (
        <div className="para:h-[240px] para:flex para:items-center para:justify-center">
          {isLoading ? (
            <Loader className="para:size-14" />
          ) : (
            <Typography className="para:text-2xl para:font-bold">No Data</Typography>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'para:flex-1 para:w-full para:flex para:flex-col para:md:flex-row para:md:h-[240px] para:md:max-h-[240px]',
            {
              ['para:px-6']: !fullWidth,
              ['para:gap-4']: RightContent,
            },
          )}
        >
          <BaseChartContainer
            config={chartConfig}
            className={cn('para:max-h-[240px] para:flex-1 para:aspect-square', {
              ['para:max-w-[240px]']: !fullWidth,
            })}
          >
            {children}
          </BaseChartContainer>
          <div className="para:h-auto para:overflow-auto">{RightContent}</div>
        </div>
      )}
    </FlatCard>
  );
};
