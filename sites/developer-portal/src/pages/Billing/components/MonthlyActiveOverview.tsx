import { useTranslation } from 'react-i18next';
import { OverviewCard } from '../../../components/OverviewCard';
import { User } from 'lucide-react';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { useOrganizationUserMetrics } from '../../../hooks/api/queries/useOrganizationUserMetrics';
import { truncateNumber } from '../../../utils/formatNumber';

export const MonthlyActiveOverview = () => {
  const { t } = useTranslation(['billing']);
  const { data: subscription, isLoading: isLoadingSubscription } = useGetOrganizationSubscription();
  const { data: userMetrics, isLoading: isLoadingMetrics } = useOrganizationUserMetrics(
    subscription?.billingPeriodStart ? new Date(subscription?.billingPeriodStart * 1000) : undefined,
    subscription?.billingPeriodEnd ? new Date(subscription?.billingPeriodEnd * 1000) : undefined,
  );

  const currentMonthlyUsers = userMetrics?.usersInTimeFrame ?? 0;
  const tiers = subscription?.tiers;
  const activePlan = subscription?.plan;
  const maxMaus = tiers?.[0].upTo ?? activePlan?.maxProdMAUs;
  const monthlyUsersString = `${currentMonthlyUsers.toLocaleString()}/${truncateNumber(maxMaus ?? 0)}`;

  return (
    <OverviewCard
      title={t('overviewCards.maus.title')}
      Icon={User}
      value={monthlyUsersString}
      className="para:w-full"
      isLoading={isLoadingSubscription || isLoadingMetrics}
    />
  );
};
