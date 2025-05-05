import { NewUsersOverview } from '../../../components/Analytics/Overview/NewUsersOverview';
import { useOrganizationTotalUsersTS } from '../../../hooks/api/queries/useOrganizationTotalUsersTS';

export const NewUsersOverviewWrapper = () => {
  const { data: usersTS, isLoading: isUsersLoading } = useOrganizationTotalUsersTS();

  return <NewUsersOverview data={usersTS} isLoading={isUsersLoading} />;
};
