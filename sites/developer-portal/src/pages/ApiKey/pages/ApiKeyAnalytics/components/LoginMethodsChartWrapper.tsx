import { useParams } from 'react-router-dom';
import { useApiKeyLoginMethodsTotal } from '../../../../../hooks/api/queries/useApiKeyLoginMethodsTotal';
import { useApiKeyTotalUserCount } from '../../../../../hooks/api/queries/useApiKeyTotalUserCount';
import { LoginMethodsChart } from '../../../../../components/Analytics/charts/LoginMethodsChart';

export const LoginMethodsChartWrapper = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: loginMethods, isLoading: isMethodsLoading } = useApiKeyLoginMethodsTotal(projectId!, apiKey!, env!);
  const { data: totalUsers, isLoading: isTotalLoading } = useApiKeyTotalUserCount(projectId!, apiKey!, env!);

  return (
    <LoginMethodsChart
      loginMethods={loginMethods}
      isMethodsLoading={isMethodsLoading}
      totalUsers={totalUsers}
      isTotalLoading={isTotalLoading}
    />
  );
};
