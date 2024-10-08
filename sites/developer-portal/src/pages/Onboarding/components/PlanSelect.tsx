import styled from 'styled-components';
import { CenteredText } from '../../../components/common';
import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { useGetOrganizationEnterprisePrice } from '../../../hooks/api/queries/useOrganizationEnterprisePrice';
import { PlanCard } from '../../../components/PlanCard/PlanCard';
import { useStripePlan } from '../../../hooks/useStripePlan';
import { ENTERPRISE_PLAN_SLUG, FREE_PLAN_SLUG } from '../../../utils/constants';
import { useCreateOrganization } from '../../../hooks/api/mutations/useCreateOrganization';
import { triggerToast } from '../../../utils/toasts';
import { useSetSelectedOrganizationWithNavigation } from '../../../hooks/useSetSelectedOrganizationWithNavigation';

interface PlanSelectProps {
  orgName: string;
}

export const PlanSelect = ({ orgName }: PlanSelectProps) => {
  const { planMeta } = usePlanMetadata();
  const { data: enterprisePrice } = useGetOrganizationEnterprisePrice();
  const { changePlan, isCreatingStripeSession } = useStripePlan();
  const { mutate: createOrganization, isPending: isCreatingOrg } = useCreateOrganization();
  const { setSelectedOrganization } = useSetSelectedOrganizationWithNavigation(true);

  const handleUpgradeClick = async (planSlug: string) => {
    createOrganization(
      { data: { organizationName: orgName } },
      {
        onSuccess: async data => {
          if (planSlug === FREE_PLAN_SLUG) {
            setSelectedOrganization();
            return;
          }
          if (planSlug.toUpperCase() === ENTERPRISE_PLAN_SLUG) {
            return;
          }
          await changePlan(planSlug, data.organization.id, location.origin);
        },
        onError: () => {
          triggerToast({
            variant: 'error',
            title: 'Error Creating Your Organization',
            body: 'Please try again. If the problem persists, contact Capsule support.',
          });
        },
      },
    );
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
                  disabled={isCreatingOrg || isCreatingStripeSession}
                  onUpgradeClick={handleUpgradeClick}
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
  margin-top: 77px;
`;

const PlanContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
`;
