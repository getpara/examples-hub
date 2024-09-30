import { CpslText } from '@usecapsule/react-components';
import { useOrganizationTotalUsersTS } from '../../../hooks/api/queries/useOrganizationTotalUsersTS';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { ContentType } from 'recharts/types/component/Tooltip';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { TimeSeriesChartCard } from '../../../components/ChartCards/TimeSeriesChartCard';
import { pluralize } from '../../../utils/pluralize';

const CustomTooltip: ContentType<ValueType, NameType> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return <CpslText>{payload[0].value}</CpslText>;
  }

  return null;
};

export const TotalUsersTSChart = () => {
  const { data: usersTS } = useOrganizationTotalUsersTS();

  if (!usersTS?.length) {
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
            domain={[usersTS[0]?.date, usersTS[usersTS.length - 1]?.date]}
            type="number"
            tickFormatter={date => `${format(new Date(date), 'MMM d')}`}
            tickLine={false}
            tickMargin={12}
            ticks={
              usersTS.length > 1
                ? [
                    usersTS[1]?.date,
                    ...(usersTS.length >= 6 ? [usersTS[Math.round(usersTS.length * 0.25)]?.date] : []),
                    ...(usersTS.length >= 3 ? [usersTS[Math.round(usersTS.length * 0.5)]?.date] : []),
                    ...(usersTS.length >= 6 ? [usersTS[Math.round(usersTS.length * 0.75)]?.date] : []),
                    usersTS[usersTS.length - 1]?.date,
                  ]
                : [usersTS[0]?.date]
            }
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
