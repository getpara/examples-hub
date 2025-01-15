import styled from 'styled-components';
import { CenteredText } from '../../../components/common';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { useGetOrganizationEnterprisePrice } from '../../../hooks/api/queries/useOrganizationEnterprisePrice';
import { PlanCard } from '../../../components/PlanCard/PlanCard';
import { ENTERPRISE_PLAN_SLUG } from '../../../utils/constants';
import { useSubmitOnboarding } from '../hooks/useSubmitOnboarding';

export const PlanSelect = () => {
  const { planMeta } = usePlanMetadata();
  const { data: enterprisePrice } = useGetOrganizationEnterprisePrice();
  const { submitOnboarding, isLoading } = useSubmitOnboarding();

  const handleSubmitClick = async (planSlug: string) => {
    await submitOnboarding(planSlug);
  };

  return (
    <>
      <OuterContainer>
        <InnerContainer>
          <CenteredText variant="headingS" weight="semiBold">
            Choose Your Tier
          </CenteredText>
          <PlanContainer>
            {planMeta
              .filter(plan => plan.slug !== ENTERPRISE_PLAN_SLUG)
              ?.map(planMetadata => (
                <PlanCard
                  key={planMetadata.slug}
                  planMetadata={planMetadata}
                  isActive={false}
                  isHigherPlanActive={false}
                  disabled={isLoading}
                  onUpgradeClick={handleSubmitClick}
                  enterprisePrice={enterprisePrice}
                  type="onboarding"
                />
              ))}
          </PlanContainer>
        </InnerContainer>
      </OuterContainer>
    </>
  );
};

const OuterContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
`;

const PlanContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
`;
