import { PieChart, Pie, Cell } from 'recharts';
import { PieChartCard } from '../../../components/ChartCards/PieChartCard';
import { useOrganizationLoginMethodsTotal } from '../../../hooks/api/queries/useOrganizationLoginMethodsTotal';
import { LOGIN_METHOD_CONFIG } from '../../../utils/constants';
import { pluralize } from '../../../utils/pluralize';

export const LoginMethodsTotalChart = () => {
  const { data: loginMethods } = useOrganizationLoginMethodsTotal();

  if (!loginMethods?.length) {
    return null;
  }

  const totalMethods = loginMethods?.length ?? 0;

  return (
    <PieChartCard
      heading={`${totalMethods} Login ${pluralize(totalMethods, 'Method')}`}
      legendData={loginMethods.map(lm => ({
        label: LOGIN_METHOD_CONFIG[lm.method].label || lm.method,
        totalCount: lm.count,
        value: lm.percent,
      }))}
      Chart={
        <PieChart>
          <Pie data={loginMethods} dataKey="percent" nameKey="method" outerRadius={165}>
            {loginMethods.map((_, index) => (
              <Cell style={{ outline: 'none' }} key={`cell-${index}`} fill={`var(--cpsl-color-foreground-${index * 8})`} />
            ))}
          </Pie>
        </PieChart>
      }
    />
  );
};
