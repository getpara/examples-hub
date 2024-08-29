import { useState } from 'react';
import { usePlans } from '../../../hooks/configs/usePlans';
import { PlanCard } from './PlanCard';
import { UpgradePlanModal } from '../../../components/UpgradePlanModal/UpgradePlanModal';
import { useGetOrganizationPlan, useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';

export const Plans = () => {
  const { plans } = usePlans();
  const { data: activePlan } = useGetOrganizationPlan();
  const { data: org } = useGetSelectedOrganization();

  const [selectedPlanName, setSelectedPlanName] = useState('');
  const [selectedPlanSlug, setSelectedPlanSlug] = useState('');

  const activeSlug = activePlan?.slug;
  const activeIndex = plans?.findIndex(p => p.slug === activeSlug);

  const handleUpgradeClick = (planName: string, planSlug: string) => {
    setSelectedPlanName(planName);
    setSelectedPlanSlug(planSlug);
  };

  const handleCloseUpgradeModal = () => {
    setSelectedPlanSlug('');
  };

  const handleUpgradeModalExited = () => {
    setSelectedPlanName('');
  };

  return (
    <>
      {plans?.map((plan, index) => (
        <PlanCard
          key={plan.slug}
          plan={plan}
          isActive={plan.slug === activeSlug}
          isHigherPlanActive={index < activeIndex}
          disabled={org?.hasRequestedUpgrade}
          onUpgradeClick={handleUpgradeClick}
        />
      ))}
      <UpgradePlanModal
        open={!!selectedPlanSlug}
        planName={selectedPlanName}
        planSlug={selectedPlanSlug}
        onClose={handleCloseUpgradeModal}
        onExited={handleUpgradeModalExited}
      />
    </>
  );
};
