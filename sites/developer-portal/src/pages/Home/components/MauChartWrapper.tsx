import { MauChart } from '../../../components/Analytics/charts/MauChart';
import { useOrganizationMonthlyActiveUsersTS } from '../../../hooks/api/queries/useOrganizationMonthlyActiveUsersTS';

export const MauChartWrapper = () => {
  const { data, isLoading } = useOrganizationMonthlyActiveUsersTS();

  return <MauChart data={data} isLoading={isLoading} />;
};
