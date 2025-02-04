import styled from 'styled-components';
import { CpslButton, CpslText } from '@getpara/react-components';
import { InlineText } from '../../components/common';
import { GradientCTAButton } from '../../components/GradientCTAButton/GradientCTAButton';
import { usePlan } from '../../hooks/api/queries/usePlans';
import {
  useGetOrganizationSubscription,
  useHasStripeSubscription,
  useWillStripeSubscriptionCancel,
} from '../../hooks/api/queries/useOrganizationSubscription';
import { useStripePlan } from '../../hooks/useStripePlan';
import { PlanMetadata } from '../../types/planMetadata';
import { ENTERPRISE_PLAN_SLUG, MOST_POPULAR_PLAN_SLUG } from '../../utils/constants';
import { PlanCardType } from './PlanCard';
import { GradientBadge } from '../GradientBadge/GradientBadge';

interface PlanCardLeftProps extends Pick<PlanMetadata, 'name' | 'allowanceString' | 'footnote' | 'monthlyCost' | 'slug'> {
  isActive?: boolean;
  isHigherPlanActive?: boolean;
  disabled?: boolean;
  enterprisePrice?: number;
  type?: PlanCardType;
  onUpgradeClick: (planSlug: string) => void;
}

export const PlanCardLeft = ({
  name,
  allowanceString,
  footnote,
  isActive,
  isHigherPlanActive,
  slug,
  disabled,
  enterprisePrice,
  type,
  onUpgradeClick,
}: PlanCardLeftProps) => {
  const { data: subscription } = useGetOrganizationSubscription();
  const { data: willSubscriptionCancel } = useWillStripeSubscriptionCancel();
  const { data: hasStripeSubscription } = useHasStripeSubscription();
  const { createCustomerPortalSession } = useStripePlan();
  const { data: plan, isLoading: isPriceLoading } = usePlan(slug);

  const isBillingType = type === 'billing';
  const isMostPopular = slug === MOST_POPULAR_PLAN_SLUG;
  const isSubscribed = subscription?.plan.slug.toUpperCase() === slug;

  const isEnterprise = slug.toUpperCase() === ENTERPRISE_PLAN_SLUG;

  const isTieredPrice = (isSubscribed ? subscription : plan)?.isTieredPrice;
  const tiers = (isSubscribed ? subscription : plan)?.tiers;
  const planPrice = (isTieredPrice ? (tiers?.[0].flatPrice ?? 0) : ((isSubscribed ? subscription : plan)?.price ?? 0)) / 100;
  const tierUnitPrice = (tiers?.[1]?.unitPrice ?? 0) / 100;
  // If this is the plan the org is subscribed to, show the price they are paying
  // Else if its the enterprise option show their enterprise price if applicable or set to 0 to show the "Ask Us" CTA
  // Default to the default plan price from Stripe
  const monthlyCostString = isSubscribed ? planPrice : isEnterprise ? (enterprisePrice ?? 0) : planPrice;
  const allowanceStringWithTier = isTieredPrice ? `0-${(tiers?.[0].upTo ?? 0).toLocaleString()} Users/mo*` : allowanceString;
  const footnoteWithTier = isTieredPrice
    ? `*Additional users above the limit are charged at $${tierUnitPrice} per user.`
    : footnote;

  const handleUpgradePlanClick = () => {
    onUpgradeClick(slug);
  };

  const handleManagePlanClick = async () => {
    createCustomerPortalSession({});
  };

  const CTAButton = isBillingType || isMostPopular ? GradientCTAButton : CpslButton;

  return (
    <Container>
      <TopContainer>
        <NameContainer>
          <CpslText variant="bodyL" weight="semiBold">
            {name}
          </CpslText>
          {!isBillingType && isMostPopular && <GradientBadge text="Most Popular" icon="star04Filled" />}
        </NameContainer>
        {isEnterprise && !enterprisePrice ? (
          <CpslText variant="headingS" weight="bold">
            Ask Us!
          </CpslText>
        ) : (
          <>
            <span>
              <InlineText variant="headingS" weight="bold">
                {isPriceLoading ? '-' : `$${monthlyCostString}`}
              </InlineText>
              <InlineText variant="bodyS" color="secondary">
                /mo
              </InlineText>
            </span>
            <CpslText variant="bodyS" color="tertiary">
              {allowanceStringWithTier}
            </CpslText>
          </>
        )}
        {isHigherPlanActive ? null : isActive ? (
          <>
            <CurrentPlanContainer $willCancel={willSubscriptionCancel}>
              <CpslText variant="body2XS" color={willSubscriptionCancel ? 'error' : 'tertiary'} weight="medium">
                {willSubscriptionCancel ? 'Pending Cancellation' : 'CURRENT PLAN'}
              </CpslText>
            </CurrentPlanContainer>
            {hasStripeSubscription && (
              <CpslButton onClick={handleManagePlanClick}>
                {willSubscriptionCancel ? 'Renew Plan' : 'Manage Plan'}
              </CpslButton>
            )}
          </>
        ) : (
          <CTAButton noIcon={!isBillingType} disabled={disabled} onClick={handleUpgradePlanClick}>
            {isBillingType ? 'Upgrade' : 'Choose'}
          </CTAButton>
        )}
      </TopContainer>
      {footnoteWithTier && (
        <BottomContainer>
          <CpslText variant="body2XS" color="tertiary" weight="medium">
            {footnoteWithTier}
          </CpslText>
        </BottomContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BottomContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
`;

const CurrentPlanContainer = styled.div<{ $willCancel?: boolean }>`
  width: fit-content;
  padding: 8px 16px;
  border: 1px solid;
  border-color: ${({ $willCancel }) => ($willCancel ? 'var(--cpsl-color-utility-red)' : 'var(--cpsl-color-background-4)')};
  border-radius: 4px;
`;

const NameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
