import { useParams } from 'react-router-dom';
import { useApiKeyMonthlyActiveUsersTS } from '../../../../../hooks/api/queries/useApiKeyMonthlyActiveUsersTS';
import { BarChart } from './BarChart';
import { ChartConfig } from '@getpara/react-component-library';
import { format } from 'date-fns';

const chartConfig = {
  activeUsers: {
    label: 'Monthly Active Users',
  },
} satisfies ChartConfig;

export const MauChart = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: mauTS, isLoading: isMausLoading } = useApiKeyMonthlyActiveUsersTS(projectId!, apiKey!, env!);

  return (
    <BarChart<'date', number, 'activeUsers', number>
      title="Monthly Active Users"
      id={'mauBar'}
      data={mauTS}
      xAxisKey={'date'}
      yAxisKey={'activeUsers'}
      chartConfig={chartConfig}
      xTickFormatter={v => format(new Date(v), 'MMM')}
      isLoading={isMausLoading}
    />
  );
};
