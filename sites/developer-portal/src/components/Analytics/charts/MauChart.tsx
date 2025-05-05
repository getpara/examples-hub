import { BarChart } from '../../../components/Charts/Bar/BarChart';
import { ChartConfig } from '@getpara/react-component-library';
import { format } from 'date-fns';
import { ApiKeyMonthlyActiveUsersTSResponse } from '../../../types/api';

const chartConfig = {
  activeUsers: {
    label: 'Monthly Active Users',
  },
} satisfies ChartConfig;

type MauChartProps = {
  data?: ApiKeyMonthlyActiveUsersTSResponse['data'];
  isLoading?: boolean;
};

export const MauChart = ({ data, isLoading }: MauChartProps) => {
  return (
    <BarChart<'date', number, 'activeUsers', number>
      title="Monthly Active Users"
      id={'mauBar'}
      data={data}
      xAxisKey={'date'}
      yAxisKey={'activeUsers'}
      chartConfig={chartConfig}
      xTickFormatter={v => format(new Date(v), 'MMM')}
      isLoading={isLoading}
    />
  );
};
