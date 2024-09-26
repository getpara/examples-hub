import styled from 'styled-components';
import { AnalyticsCard } from '../../../components/AnalyticsCard/AnalyticsCard';
import { truncateNumber } from '../../../utils/formatNumber';
import { useOrganizationUserMetrics } from '../../../hooks/api/queries/useOrganizationUserMetrics';
import { differenceInCalendarDays, endOfDay, startOfMonth } from 'date-fns';
import {
  useGetOrganizationSubscription,
  useHasStripeSubscription,
  useWillStripeSubscriptionCancel,
} from '../../../hooks/api/queries/useOrganizationSubscription';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { PLAN_PERMISSIONS, PlanSlug } from '../../../utils/constants';

export const PlanMetrics = () => {
  const { planMetaBySlug } = usePlanMetadata();
  const { data: subscription } = useGetOrganizationSubscription();
  const { data: willSubscriptionCancel } = useWillStripeSubscriptionCancel();
  const { data: hasStripeSubscription } = useHasStripeSubscription();
  const { data: userMetrics } = useOrganizationUserMetrics(startOfMonth(new Date()), endOfDay(new Date()));

  const activePlan = subscription?.plan;
  const planMetadata = planMetaBySlug[activePlan?.slug ?? ''];
  const planPermissions = PLAN_PERMISSIONS[(activePlan?.slug as PlanSlug) ?? PlanSlug.FREE];
  const isTotalUserPlan = typeof planPermissions?.maxUsers === 'number';
  const isMauPlan = typeof planPermissions?.maxMonthlyUsers === 'number';

  const monthlyUsersString = `${userMetrics?.usersInTimeFrame ?? 0}${isMauPlan ? `/${truncateNumber(planPermissions?.maxMonthlyUsers ?? 0)}` : ''}`;
  const totalUsersString = `${userMetrics?.totalUsers ?? 0}${isTotalUserPlan ? `/${planPermissions?.maxUsers}` : ''}`;
  const activePlanName = planMetadata?.name ?? '';
  const activePlanPrice = `Current Plan${hasStripeSubscription ? `: $${(subscription?.price ?? 0) / 100}/mo` : ''}`;
  const daysRemaining = subscription?.periodEnd
    ? `${differenceInCalendarDays(new Date(subscription.periodEnd * 1000), new Date())} days`
    : undefined;

  return (
    <>
      <Container>
        <AnalyticsCard title={activePlanName} subtitle={activePlanPrice} />
        {!isTotalUserPlan && <AnalyticsCard title={monthlyUsersString} subtitle="Users this month" />}
        <AnalyticsCard title={totalUsersString} subtitle={isTotalUserPlan ? 'Users' : 'Total Users'} />
        {daysRemaining && (
          <AnalyticsCard
            title={daysRemaining}
            subtitle={willSubscriptionCancel ? 'Until Cancellation' : 'Left in current billing period'}
            subtitleColor={willSubscriptionCancel ? 'error' : 'tertiary'}
          />
        )}
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
