import { useParams } from 'react-router-dom';
import { useApiKeyLoginMethodsTotal } from '../../../../../hooks/api/queries/useApiKeyLoginMethodsTotal';
import { PieChart } from './PieChart';
import { useMemo } from 'react';
import { LOGIN_METHOD_CONFIG } from '../../../../../utils/constants';
import { useApiKeyTotalUserCount } from '../../../../../hooks/api/queries/useApiKeyTotalUserCount';
import { truncateNumber } from '../../../../../utils/formatNumber';

const chartConfig = Object.entries(LOGIN_METHOD_CONFIG).reduce((acc, val) => {
  acc[val[0]] = val[1];

  return acc;
}, {});

export const LoginMethodsChart = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: loginMethods, isLoading: isMethodsLoading } = useApiKeyLoginMethodsTotal(projectId!, apiKey!, env!);
  const { data: totalUsers, isLoading: isTotalLoading } = useApiKeyTotalUserCount(projectId!, apiKey!, env!);

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
