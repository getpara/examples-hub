import { CpslText } from '@usecapsule/react-components';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { TODAY } from '../../../utils/constants';
import { ContentType } from 'recharts/types/component/Tooltip';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { TimeSeriesChartCard } from '../../../components/ChartCards/TimeSeriesChartCard';
import { useParams } from 'react-router-dom';
import { useApiKeyTotalUsersTS } from '../../../hooks/api/queries/useApiKeyTotalUsersTS';
import { pluralize } from '../../../utils/pluralize';

const CustomTooltip: ContentType<ValueType, NameType> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return <CpslText>{payload[0].value}</CpslText>;
  }

  return null;
};

export const TotalUsersTSChart = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: usersTS } = useApiKeyTotalUsersTS(projectId!, apiKey!, env!);

  if (!usersTS) {
    return null;
  }

  const totalUsers = usersTS[usersTS.length - 1].newUsers ?? 0;

  return (
    <TimeSeriesChartCard
      heading={`${totalUsers} ${pluralize(totalUsers, 'User')}`}
      Chart={
        <AreaChart data={usersTS}>
          <Area type="monotone" dataKey="newUsers" stroke="var(--cpsl-color-foreground-0)" fill="#C0C0C0" />
          <XAxis
            dataKey="date"
            domain={[usersTS[0].date, usersTS[usersTS.length - 1].date]}
            type="number"
            tickFormatter={date => `${differenceInCalendarDays(TODAY, startOfDay(new Date(date)))}`}
            tickCount={6}
            tickLine={false}
            tickMargin={12}
            axisLine={{ stroke: '#E6E6E6' }}
            style={{ fontSize: 16, fill: '#666666' }}
            fontFamily="Inter"
          />
          <YAxis padding={{ bottom: 4 }} tick={false} axisLine={false} width={0} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#666666', strokeWidth: 2 }} />
        </AreaChart>
      }
    />
  );
};
