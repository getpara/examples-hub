import { useParams } from 'react-router-dom';
import { useApiKeyTotalUsersTS } from '../../../../../hooks/api/queries/useApiKeyTotalUsersTS';
import { NewUsersOverview } from '../../../../../components/Analytics/Overview/NewUsersOverview';

export const NewUsersOverviewWrapper = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: usersTS, isLoading: isUsersLoading } = useApiKeyTotalUsersTS(projectId!, apiKey!, env!);

  return <NewUsersOverview data={usersTS} isLoading={isUsersLoading} />;
};
