import { useState } from 'react';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { RequestEnterpriseModal } from '../../../components/RequestEnterpriseModal/RequestEnterpriseModal';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { useGetOrganizationEnterprisePrice } from '../../../hooks/api/queries/useOrganizationEnterprisePrice';
import { CpslIcon, CpslText } from '@getpara/react-components';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { PlanCard } from '../../../components/PlanCard/PlanCard';
import { UpgradeModal } from './UpgradeModal';
import { useStripePlan } from '../../../hooks/useStripePlan';
import { FREE_PLAN_SLUG, MOBILE_SIZE } from '../../../utils/constants';
import { styled } from 'styled-components';
import { BaseCard } from '../../../components/common';

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
      <InfoContainer>
        <InfoContent>
          <Icon icon="star05" />
          <CpslText variant="bodyM" weight="medium">
            All plans include up to 50 users in your Beta Environment where all Para features from all plan tiers are
            available.
          </CpslText>
        </InfoContent>
      </InfoContainer>
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

const InfoContainer = styled(BaseCard)`
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    width: 848px;
  }

  max-width: 848px;

  --card-border-color: #ff4e00;
`;

const InfoContent = styled.div`
  display: flex;
  gap: 16px;
`;

const Icon = styled(CpslIcon)`
  --icon-color: #ff4e00;
`;
