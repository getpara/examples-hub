import { useState } from 'react';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { RequestEnterpriseModal } from '../../../components/RequestEnterpriseModal/RequestEnterpriseModal';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { useGetOrganizationEnterprisePrice } from '../../../hooks/api/queries/useOrganizationEnterprisePrice';
import { CpslText } from '@getpara/react-components';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { PlanCard } from '../../../components/PlanCard/PlanCard';
import { UpgradeModal } from './UpgradeModal';
import { useStripePlan } from '../../../hooks/useStripePlan';
import { FREE_PLAN_SLUG } from '../../../utils/constants';

export const Plans = () => {
  const { planMeta } = usePlanMetadata();
  const { data: subscription } = useGetOrganizationSubscription();
  const { data: org } = useGetSelectedOrganization();
  const { data: enterprisePrice } = useGetOrganizationEnterprisePrice();
  const { changePlan, isCreatingStripeSession } = useStripePlan();

  const [isRequestingEnterprise, setIsRequestingEnterprise] = useState(false);
  const [upgradingPlanSlug, setUpgradingPlanSlug] = useState<string>();

  const activeSlug = subscription?.plan.slug;
  const activeIndex = planMeta?.findIndex(p => p.slug === activeSlug);

  const handleUpgradeClick = async (planSlug: string) => {
    if (planSlug.toUpperCase() === 'ENTERPRISE' && !org?.enterpriseStripePriceId) {
      setIsRequestingEnterprise(true);
      return;
    }
    if (activeSlug !== FREE_PLAN_SLUG) {
      setUpgradingPlanSlug(planSlug);
    } else {
      await changePlan(planSlug);
    }
  };

  const handleCloseEnterpriseModal = () => {
    setIsRequestingEnterprise(false);
  };

  const handleCloseUpgradeModal = () => {
    setUpgradingPlanSlug(undefined);
  };

  return (
    <>
      <CpslText variant="bodyL" weight="semiBold">
        Plans
      </CpslText>
      {planMeta?.map((planMetadata, index) => (
        <PlanCard
          key={planMetadata.slug}
          planMetadata={planMetadata}
          isActive={planMetadata.slug.toUpperCase() === activeSlug}
          isHigherPlanActive={index < activeIndex}
          disabled={org?.hasRequestedUpgrade || isCreatingStripeSession}
          onUpgradeClick={handleUpgradeClick}
          enterprisePrice={enterprisePrice}
        />
      ))}
      <RequestEnterpriseModal open={!!isRequestingEnterprise} onClose={handleCloseEnterpriseModal} />
      <UpgradeModal open={!!upgradingPlanSlug} planSlug={upgradingPlanSlug ?? ''} onClose={handleCloseUpgradeModal} />
    </>
  );
};
