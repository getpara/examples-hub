import styled from 'styled-components';
import { CpslButton, CpslText } from '@usecapsule/react-components';
import { InlineText } from '../../../components/common';
import { GradientCTAButton } from '../../../components/GradientCTAButton/GradientCTAButton';
import { usePlan } from '../../../hooks/api/queries/usePlans';
import {
  useGetOrganizationSubscription,
  useHasStripeSubscription,
  useWillStripeSubscriptionCancel,
} from '../../../hooks/api/queries/useOrganizationSubscription';
import { useStripePlan } from '../../../hooks/useStripePlan';
import { PlanMetadata } from '../../../types/planMetadata';

interface PlanCardLeftProps extends Pick<PlanMetadata, 'name' | 'allowanceString' | 'footnote' | 'monthlyCost' | 'slug'> {
  isActive?: boolean;
  isHigherPlanActive?: boolean;
  disabled?: boolean;
  enterprisePrice?: number;
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
  onUpgradeClick,
}: PlanCardLeftProps) => {
  const { data: subscription } = useGetOrganizationSubscription();
  const { data: willSubscriptionCancel } = useWillStripeSubscriptionCancel();
  const { data: hasStripeSubscription } = useHasStripeSubscription();
  const { createCustomerPortalSession } = useStripePlan();

  const isSubscribed = subscription?.plan.slug.toUpperCase() === slug;

  const isEnterprise = slug.toUpperCase() === 'ENTERPRISE';
  const { data: planPrice, isLoading: isPriceLoading } = usePlan(slug);
  // If this is the plan the org is subscribed to, show the price they are paying
  // Else if its the enterprise option show their enterprise price if applicable or set to 0 to show the "Ask Us" CTA
  // Default to the default plan price from Stripe
  const monthlyCostString =
    subscription && isSubscribed
      ? (subscription.price ?? 0) / 100
      : isEnterprise
        ? (enterprisePrice ?? 0)
        : (planPrice ?? 0);

  const handleUpgradePlanClick = () => {
    onUpgradeClick(slug);
  };

  const handleManagePlanClick = async () => {
    createCustomerPortalSession({});
  };

  return (
    <Container>
      <TopContainer>
        <CpslText variant="bodyL" weight="semiBold">
          {name}
        </CpslText>
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
              {allowanceString}
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
          <GradientCTAButton disabled={disabled} onClick={handleUpgradePlanClick}>
            Upgrade
          </GradientCTAButton>
        )}
      </TopContainer>
      {footnote && (
        <BottomContainer>
          <CpslText variant="body2XS" color="tertiary" weight="medium">
            {footnote}
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
