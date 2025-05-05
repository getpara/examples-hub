import { OverviewCard } from './OverviewCard';
import { Users } from 'lucide-react';
import { getPercentChange } from '../../../utils/getPercentChange';

type NewUsersOverviewProps = {
  data?: {
    newUsers: number;
    date: number;
  }[];
  isLoading: boolean;
};

export const NewUsersOverview = ({ data, isLoading }: NewUsersOverviewProps) => {
  const lastTwoDays = data?.slice(-2);
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
      value={!!data ? numNew.toLocaleString() : undefined}
      change={{
        label: changeLabel,
        value: percentChange,
      }}
      isLoading={isLoading}
    />
  );
};
