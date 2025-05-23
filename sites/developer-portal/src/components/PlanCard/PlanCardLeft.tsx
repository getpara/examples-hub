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
import { Badge, Button, cn, Typography } from '@getpara/react-component-library';

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
  const allowanceStringWithTier = isTieredPrice ? `Up to ${(tiers?.[0].upTo ?? 0).toLocaleString()} MAUs*` : allowanceString;
  const additionalCharge = isTieredPrice ? `$${tierUnitPrice} per additional MAU` : '';

  const handleUpgradePlanClick = () => {
    onUpgradeClick(slug);
  };

  const handleManagePlanClick = async () => {
    createCustomerPortalSession({});
  };

  return (
    <div className="para:flex para:flex-1 para:flex-col para:gap-2">
      <div className="para:flex para:flex-col para:gap-2">
        <div className="para:flex para:items-center para:gap-2">
          <Typography className="para:text-xl para:font-semibold">{name}</Typography>
          {!isBillingType && isMostPopular && <Badge>Most Popular</Badge>}
        </div>
        {isEnterprise && !enterprisePrice ? (
          <Typography className="para:text-3xl para:font-bold">Ask Us!</Typography>
        ) : (
          <>
            <span>
              <Typography className="para:text-3xl para:font-bold para:inline">
                {isPriceLoading ? '-' : `$${monthlyCostString}`}
              </Typography>
              <Typography color="secondary" className="para:text-sm para:inline">
                /mo
              </Typography>
            </span>
            <Typography color="muted" className="para:text-sm para:font-medium">
              {allowanceStringWithTier}
            </Typography>
            {additionalCharge && (
              <Typography color="muted" className="para:text-sm para:font-medium">
                {additionalCharge}
              </Typography>
            )}
          </>
        )}
        {isHigherPlanActive ? null : isActive ? (
          <>
            <Badge
              variant="outline"
              className={cn({
                'para:border-destructive para:text-destructive': willSubscriptionCancel,
                'para:border-border para:text-secondary-foreground': !willSubscriptionCancel,
              })}
            >
              {willSubscriptionCancel ? 'Pending Cancellation' : 'CURRENT PLAN'}
            </Badge>
            {hasStripeSubscription && (
              <Button size="lg" className="para:w-fit" variant="neutral" onClick={handleManagePlanClick}>
                {willSubscriptionCancel ? 'Renew Plan' : 'Manage Plan'}
              </Button>
            )}
          </>
        ) : (
          <Button
            size="lg"
            className="para:w-fit"
            variant={isBillingType || isMostPopular ? 'default' : 'neutral'}
            onClick={handleUpgradePlanClick}
            disabled={disabled}
          >
            {isBillingType ? 'Upgrade' : 'Choose'}
          </Button>
        )}
      </div>
      {footnote && (
        <div className="para:flex para:flex-1 para:items-end">
          <Typography color="muted" className="para:text-2xs para:font-medium">
            {footnote}
          </Typography>
        </div>
      )}
    </div>
  );
};
