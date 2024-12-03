import styled from 'styled-components';
import { AnalyticsCard } from '../../../components/AnalyticsCard/AnalyticsCard';
import { truncateNumber } from '../../../utils/formatNumber';
import { useOrganizationUserMetrics } from '../../../hooks/api/queries/useOrganizationUserMetrics';
import { differenceInCalendarDays } from 'date-fns';
import {
  useGetOrganizationSubscription,
  useHasStripeSubscription,
  useWillStripeSubscriptionCancel,
} from '../../../hooks/api/queries/useOrganizationSubscription';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { ENTERPRISE_PLAN_SLUG, FREE_PLAN_SLUG } from '../../../utils/constants';
import { useOrganizationTotalUserCount } from '../../../hooks/api/queries/useOrganizationTotalUserCount';

export const PlanMetrics = () => {
  const { planMetaBySlug } = usePlanMetadata();
  const { data: subscription } = useGetOrganizationSubscription();
  const { data: willSubscriptionCancel } = useWillStripeSubscriptionCancel();
  const { data: hasStripeSubscription } = useHasStripeSubscription();
  const { data: userMetrics } = useOrganizationUserMetrics(
    subscription?.billingPeriodStart ? new Date(subscription?.billingPeriodStart * 1000) : undefined,
    subscription?.billingPeriodEnd ? new Date(subscription?.billingPeriodEnd * 1000) : undefined,
  );
  const { data: totalUsers } = useOrganizationTotalUserCount();

  const currentMonthlyUsers = userMetrics?.usersInTimeFrame ?? 0;
  const activePlan = subscription?.plan;
  const isTieredPrice = subscription?.isTieredPrice;
  const tiers = subscription?.tiers;
  // upTo will be undefined for the final tier
  const currentTier = subscription?.tiers?.filter(tier => (tier.upTo ?? Infinity) > currentMonthlyUsers)?.[0];
  const tierUnitPrice = (currentTier?.unitPrice ?? 0) / 100;
  const planPrice = (isTieredPrice ? (tiers?.[0].flatPrice ?? 0) : (subscription?.price ?? 0)) / 100;
  const planMetadata = planMetaBySlug[activePlan?.slug ?? ''];
  const isFreePlan = activePlan?.slug === FREE_PLAN_SLUG;
  const isEnterprisePlan = activePlan?.slug === ENTERPRISE_PLAN_SLUG;

  const monthlyUsersString = `${currentMonthlyUsers.toLocaleString()}${!isEnterprisePlan ? `/${truncateNumber(activePlan?.maxProdMAUs ?? 0)}` : ''}`;
  const monthlyUsersOverageString = tierUnitPrice ? ` Additional users are being charged at $${tierUnitPrice}/user` : '';
  const totalUsersString = `${(isFreePlan ? totalUsers?.lowerEnvCount : totalUsers?.count) ?? '-'}${isFreePlan ? `/${activePlan?.maxBetaUsers}` : ''}`;
  const activePlanName = planMetadata?.name ?? '';
  const activePlanPrice = `Current Plan${hasStripeSubscription ? `: $${planPrice}/mo` : ''}`;
  const daysRemaining = subscription?.periodEnd
    ? `${differenceInCalendarDays(new Date(subscription.periodEnd * 1000), new Date())} days`
    : undefined;

  return (
    <>
      <Container>
        <AnalyticsCard title={activePlanName} subtitle={activePlanPrice} />
        {!isFreePlan && (
          <AnalyticsCard
            title={monthlyUsersString}
            subtitle="Users this month"
            warning={monthlyUsersOverageString}
            useMaxWidth
          />
        )}
        <AnalyticsCard title={totalUsersString} subtitle={isFreePlan ? 'Users' : 'Total Users'} />
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
