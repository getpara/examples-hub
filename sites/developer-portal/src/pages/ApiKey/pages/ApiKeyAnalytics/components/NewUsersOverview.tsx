import { useParams } from 'react-router-dom';
import { useApiKeyTotalUsersTS } from '../../../../../hooks/api/queries/useApiKeyTotalUsersTS';
import { OverviewCard } from './OverviewCard';
import { Users } from 'lucide-react';
import { getPercentChange } from '../../../../../utils/getPercentChange';

export const NewUsersOverview = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: usersTS, isLoading: isUsersLoading } = useApiKeyTotalUsersTS(projectId!, apiKey!, env!);

  const lastTwoDays = usersTS?.slice(-2);
  const yesterdayVal = lastTwoDays?.[0]?.newUsers ?? 0;
  const todayVal = lastTwoDays?.[1]?.newUsers ?? 0;

  const numNew = todayVal - yesterdayVal;
  const percentChange = getPercentChange(todayVal, yesterdayVal);

  const isPositiveChange = percentChange >= 0;
  const changeLabel = `${isPositiveChange ? '+' : '-'}${percentChange}% from yesterday`;

  return (
    <OverviewCard
      title="New Users"
      Icon={Users}
      value={!!usersTS ? numNew.toLocaleString() : undefined}
      change={{
        label: changeLabel,
        value: percentChange,
      }}
      isLoading={isUsersLoading}
    />
  );
};
