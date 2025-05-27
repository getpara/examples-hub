import { useTranslation } from 'react-i18next';
import { OverviewCard } from '../../../components/OverviewCard';
import { DollarSign } from 'lucide-react';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';

export const PlanOverview = () => {
  const { t } = useTranslation(['billing']);
  const { planMetaBySlug } = usePlanMetadata();
  const { data: subscription, isLoading: isLoadingSubscription } = useGetOrganizationSubscription();

  const isTieredPrice = subscription?.isTieredPrice;
  const tiers = subscription?.tiers;
  const planPrice = (isTieredPrice ? (tiers?.[0].flatPrice ?? 0) : (subscription?.price ?? 0)) / 100;
  const activePlan = subscription?.plan;
  const planMetadata = planMetaBySlug[activePlan?.slug ?? ''];
  const activePlanName = planMetadata?.name ?? '';
  const activePlanPrice = t('overviewCards.plan.price', {
    price: planPrice,
  });

  return (
    <OverviewCard
      title={t('overviewCards.plan.title')}
      Icon={DollarSign}
      value={activePlanName}
      valueLabel={activePlanPrice}
      className="para:w-full"
      isLoading={isLoadingSubscription}
    />
  );
};
