import { CpslText } from '@getpara/react-components';
import { XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { ContentType } from 'recharts/types/component/Tooltip';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { TimeSeriesChartCard } from '../../../components/ChartCards/TimeSeriesChartCard';
import styled from 'styled-components';
import { truncateNumber } from '../../../utils/formatNumber';
import { getMaxDomain } from '../../../utils/chartUtils';
import { useParams } from 'react-router-dom';
import { useApiKeyMonthlyActiveUsersTS } from '../../../hooks/api/queries/useApiKeyMonthlyActiveUsersTS';
import { pluralize } from '../../../utils/pluralize';

const CustomTooltip: ContentType<ValueType, NameType> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <TooltipContainer>
        <CpslText variant="bodyXS" weight="medium">
          {payload[0].value}
        </CpslText>
      </TooltipContainer>
    );
  }

  return null;
};

export const MonthlyActiveUsersTSChart = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: mauTS } = useApiKeyMonthlyActiveUsersTS(projectId!, apiKey!, env!);

  if (!mauTS?.length) {
    return null;
  }

  const activeUsers = mauTS[mauTS.length - 1].activeUsers ?? 0;

  const maxValue = mauTS.reduce((prev, curr) => Math.max(prev, curr.activeUsers), 0);

  return (
    <TimeSeriesChartCard
      heading={`${activeUsers} Monthly Active ${pluralize(activeUsers, 'User')}`}
      Chart={
        <BarChart data={mauTS}>
          <CartesianGrid vertical={false} stroke="#E6E6E6" />
          <Bar type="monotone" dataKey="activeUsers" fill="var(--cpsl-color-foreground-0)" activeBar={false} radius={8} />
          <XAxis
            dataKey="date"
            tickFormatter={date => `${format(date, 'MMM')}`}
            tickLine={false}
            tickMargin={12}
            axisLine={false}
            style={{ fontSize: 16, fill: '#666666' }}
            fontFamily="Inter"
          />
          <YAxis
            tickLine={{ stroke: '#E6E6E6' }}
            axisLine={false}
            style={{ fontSize: 12, fill: '#666666' }}
            tickFormatter={v => (v ? `${truncateNumber(v)}` : '0')}
            domain={[0, getMaxDomain(maxValue)]}
            width={32}
            fontFamily="Inter"
            tickCount={4}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'none', fill: 'none' }} />
        </BarChart>
      }
    />
  );
};

const TooltipContainer = styled.div`
  padding: 0px 12px;
  border: 1px solid var(--cpsl-color-background-16);
  border-radius: 4px;
  background: var(--cpsl-color-background-0);
`;
