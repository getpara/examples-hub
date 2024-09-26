import { PieChart, Pie, Cell } from 'recharts';
import { PieChartCard } from '../../../components/ChartCards/PieChartCard';
import { useOrganizationLoginPlatformsTotal } from '../../../hooks/api/queries/useOrganizationLoginPlatformsTotal';
import { pluralize } from '../../../utils/pluralize';

export const LoginPlatformsTotalChart = () => {
  const { data: loginPlatforms } = useOrganizationLoginPlatformsTotal();

  if (!loginPlatforms?.length) {
    return null;
  }

  const totalPlatforms = loginPlatforms?.length ?? 0;

  return (
    <PieChartCard
      heading={`${totalPlatforms} ${pluralize(totalPlatforms, 'Platform')}`}
      legendData={loginPlatforms.map(lp => ({
        label: lp.platform,
        totalCount: lp.count,
        value: lp.percent,
      }))}
      Chart={
        <PieChart>
          <Pie data={loginPlatforms} dataKey="percent" nameKey="platform" outerRadius={165}>
            {loginPlatforms.map((_, index) => (
              <Cell style={{ outline: 'none' }} key={`cell-${index}`} fill={`var(--cpsl-color-foreground-${index * 8})`} />
            ))}
          </Pie>
        </PieChart>
      }
    />
  );
};
