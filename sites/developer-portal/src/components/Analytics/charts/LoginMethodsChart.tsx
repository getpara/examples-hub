import { useMemo } from 'react';
import { LOGIN_METHOD_CONFIG } from '../../../utils/constants';
import { truncateNumber } from '../../../utils/formatNumber';
import { PieChart } from '../../Charts/Pie/PieChart';
import { ApiKeyLoginMethodsTotalResponse, ApiKeyTotalUserCountResponse } from '../../../types/api';

const chartConfig = Object.entries(LOGIN_METHOD_CONFIG).reduce((acc, val) => {
  acc[val[0]] = val[1];

  return acc;
}, {});

type LoginMethodsChartProps = {
  loginMethods?: ApiKeyLoginMethodsTotalResponse['data'];
  isMethodsLoading?: boolean;
  totalUsers?: ApiKeyTotalUserCountResponse;
  isTotalLoading?: boolean;
};

export const LoginMethodsChart = ({
  loginMethods,
  isMethodsLoading,
  totalUsers,
  isTotalLoading,
}: LoginMethodsChartProps) => {
  const dataWithFill = useMemo(() => loginMethods?.map(m => ({ ...m, fill: `var(--color-${m.method})` })), [loginMethods]);

  return (
    <PieChart<'userCount', number, 'method', string>
      title="Users by Login Type"
      data={dataWithFill}
      nameKey="method"
      dataKey="userCount"
      chartConfig={chartConfig}
      label="Users"
      centerData={truncateNumber(totalUsers?.count ?? 0)}
      isLoading={isMethodsLoading || isTotalLoading}
    />
  );
};
