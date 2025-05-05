import { useParams } from 'react-router-dom';
import { useApiKeyMonthlyActiveUsersTS } from '../../../../../hooks/api/queries/useApiKeyMonthlyActiveUsersTS';
import { MauChart } from '../../../../../components/Analytics/charts/MauChart';

export const MauChartWrapper = () => {
  const { apiKey, env, projectId } = useParams();
  const { data, isLoading } = useApiKeyMonthlyActiveUsersTS(projectId!, apiKey!, env!);

  return <MauChart data={data} isLoading={isLoading} />;
};
