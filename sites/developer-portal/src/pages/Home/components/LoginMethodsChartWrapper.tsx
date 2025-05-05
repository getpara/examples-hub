import { LoginMethodsChart } from '../../../components/Analytics/charts/LoginMethodsChart';
import { useOrganizationLoginMethodsTotal } from '../../../hooks/api/queries/useOrganizationLoginMethodsTotal';
import { useOrganizationTotalUserCount } from '../../../hooks/api/queries/useOrganizationTotalUserCount';

export const LoginMethodsChartWrapper = () => {
  const { data: loginMethods, isLoading: isMethodsLoading } = useOrganizationLoginMethodsTotal();
  const { data: totalUsers, isLoading: isTotalLoading } = useOrganizationTotalUserCount();

  return (
    <LoginMethodsChart
      loginMethods={loginMethods}
      isMethodsLoading={isMethodsLoading}
      totalUsers={totalUsers}
      isTotalLoading={isTotalLoading}
    />
  );
};
