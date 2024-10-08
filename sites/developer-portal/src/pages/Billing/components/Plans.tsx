import { useState } from 'react';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { RequestEnterpriseModal } from '../../../components/RequestEnterpriseModal/RequestEnterpriseModal';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { useGetOrganizationEnterprisePrice } from '../../../hooks/api/queries/useOrganizationEnterprisePrice';
import { CpslText } from '@usecapsule/react-components';
import { useStripePlan } from '../../../hooks/useStripePlan';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { PlanCard } from '../../../components/PlanCard/PlanCard';

export const Plans = () => {
  const { planMeta } = usePlanMetadata();
  const { data: subscription } = useGetOrganizationSubscription();
  const { data: org } = useGetSelectedOrganization();
  const { data: enterprisePrice } = useGetOrganizationEnterprisePrice();
  const { changePlan, isCreatingStripeSession } = useStripePlan();

  const [isRequestingEnterprise, setIsRequestingEnterprise] = useState(false);

  const activeSlug = subscription?.plan.slug;
  const activeIndex = planMeta?.findIndex(p => p.slug === activeSlug);

  const handleUpgradeClick = async (planSlug: string) => {
    if (planSlug.toUpperCase() === 'ENTERPRISE' && !org?.enterpriseStripePriceId) {
      setIsRequestingEnterprise(true);
      return;
    }
    await changePlan(planSlug);
  };

  const handleCloseUpgradeModal = () => {
    setIsRequestingEnterprise(false);
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
      <RequestEnterpriseModal open={!!isRequestingEnterprise} onClose={handleCloseUpgradeModal} />
    </>
  );
};
