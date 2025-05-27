import { useTranslation } from 'react-i18next';
import { OverviewCard } from '../../../components/OverviewCard';
import { Users } from 'lucide-react';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { useOrganizationTotalUsersTS } from '../../../hooks/api/queries/useOrganizationTotalUsersTS';
import { lastDayOfMonth, startOfMonth, subMonths } from 'date-fns';
import { useOrganizationTotalUserCount } from '../../../hooks/api/queries/useOrganizationTotalUserCount';
import { getPercentChange } from '../../../utils/getPercentChange';

export const TotalUsersOverview = () => {
  const { t } = useTranslation(['billing']);
  const { data: subscription, isLoading: isLoadingSubscription } = useGetOrganizationSubscription();

  const lastBillingEnd = subscription?.billingPeriodEnd
    ? new Date(subscription?.billingPeriodEnd * 1000)
    : lastDayOfMonth(subMonths(new Date(), 1));

  const { data: totalUsers, isLoading: isTotalUsersLoading } = useOrganizationTotalUserCount();
  const { data: usersTS, isLoading: isLastMonthUsersLoading } = useOrganizationTotalUsersTS(
    startOfMonth(lastBillingEnd),
    lastBillingEnd,
  );

  const numUsersNow = totalUsers?.count ?? 0;
  const numUsersAtEndOfLastCycle = usersTS?.[usersTS.length - 1]?.newUsers ?? 0;
  const percentChange = getPercentChange(numUsersNow, numUsersAtEndOfLastCycle);
  const isPositiveChange = percentChange >= 0;
  const changeLabel = t('overviewCards.totalUsers.change', {
    changeSign: isPositiveChange ? '+' : '-',
    change: percentChange,
  });

  return (
    <OverviewCard
      title={t('overviewCards.totalUsers.title')}
      Icon={Users}
      value={numUsersNow.toLocaleString()}
      changeValue={percentChange}
      valueLabel={changeLabel}
      className="para:w-full"
      isLoading={isLastMonthUsersLoading || isTotalUsersLoading || isLoadingSubscription}
    />
  );
};
