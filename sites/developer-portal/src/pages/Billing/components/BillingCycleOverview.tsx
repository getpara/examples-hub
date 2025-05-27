import { useTranslation } from 'react-i18next';
import { OverviewCard } from '../../../components/OverviewCard';
import { Calendar } from 'lucide-react';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { differenceInCalendarDays } from 'date-fns';

export const BillingCycleOverview = () => {
  const { t } = useTranslation(['billing']);
  const { data: subscription, isLoading: isLoadingSubscription } = useGetOrganizationSubscription();

  const daysRemaining = subscription?.periodEnd
    ? `${differenceInCalendarDays(new Date(subscription.periodEnd * 1000), new Date())} days`
    : undefined;

  if (!isLoadingSubscription && !daysRemaining) {
    return null;
  }

  return (
    <OverviewCard
      title={t('overviewCards.billingCycle.title')}
      Icon={Calendar}
      value={daysRemaining}
      className="para:w-full"
      isLoading={isLoadingSubscription}
    />
  );
};
