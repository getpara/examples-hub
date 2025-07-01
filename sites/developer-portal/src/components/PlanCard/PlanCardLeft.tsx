import { usePlan } from '../../hooks/api/queries/usePlans';
import { useGetOrganizationSubscription } from '../../hooks/api/queries/useOrganizationSubscription';
import { PlanMetadata } from '../../types/planMetadata';
import { ENTERPRISE_PLAN_SLUG, MOST_POPULAR_PLAN_SLUG } from '../../utils/constants';
import { PlanCardType } from './PlanCard';
import { Badge, Button, Typography } from '@getpara/react-component-library';
import { Trans, useTranslation } from 'react-i18next';
import { useOrganizationMemberCapabilities } from '../../hooks/api/queries/useOrganizationMember';

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
  const { t } = useTranslation(['billing']);
  const { data: subscription } = useGetOrganizationSubscription();
  const { data: plan, isLoading: isPriceLoading } = usePlan(slug);
  const { data: memberCapabilities } = useOrganizationMemberCapabilities();

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
  const allowanceStringWithTier = isTieredPrice
    ? t('plans.plan.allowance', {
        allowance: (tiers?.[0].upTo ?? 0).toLocaleString(),
      })
    : allowanceString;
  const overageCost = isTieredPrice ? t('plans.plan.overageCost', { cost: tierUnitPrice }) : '';

  const handleUpgradePlanClick = () => {
    onUpgradeClick(slug);
  };

  return (
    <div className="para:flex para:flex-1 para:flex-col para:gap-2">
      <div className="para:flex para:flex-col para:gap-2">
        <div className="para:flex para:items-center para:gap-2">
          <Typography className="para:text-xl para:font-semibold">{name}</Typography>
          {!isBillingType && isMostPopular && <Badge>{t('plans.plan.popular')}</Badge>}
        </div>
        {isEnterprise && !enterprisePrice ? (
          <Typography className="para:text-3xl para:font-bold">{t('plans.plan.enterpriseCTA')}</Typography>
        ) : (
          <>
            <Typography color="secondary" className="para:text-sm para:inline" variant="span">
              {isPriceLoading ? (
                '-'
              ) : (
                <Trans
                  t={t}
                  i18nKey="plans.plan.monthlyPrice"
                  values={{ price: monthlyCostString }}
                  components={{ bold: <Typography className="para:text-3xl para:font-bold para:inline" /> }}
                />
              )}
            </Typography>
            <Typography color="secondary" className="para:text-sm">
              {allowanceStringWithTier}
            </Typography>
            {isTieredPrice && (
              <Typography color="secondary" className="para:text-sm">
                {overageCost}
              </Typography>
            )}
          </>
        )}
        {(!isBillingType || memberCapabilities?.canUpdateOrganizationBilling) && (
          <Button
            size="lg"
            className="para:w-fit"
            variant={(isBillingType && !isHigherPlanActive) || (!isBillingType && isMostPopular) ? 'default' : 'neutral'}
            onClick={handleUpgradePlanClick}
            disabled={disabled || isActive}
          >
            {isActive
              ? t('plans.plan.buttons.current')
              : isEnterprise && !enterprisePrice
                ? t('plans.plan.buttons.enterpriseCTA')
                : isBillingType && !isHigherPlanActive
                  ? t('plans.plan.buttons.upgrade')
                  : t('plans.plan.buttons.downgrade')}
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
