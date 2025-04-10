import { usePlanMetadata } from '../../../hooks/configs/usePlanMetadata';
import { useGetOrganizationEnterprisePrice } from '../../../hooks/api/queries/useOrganizationEnterprisePrice';
import { PlanCard } from '../../../components/PlanCard/PlanCard';
import { ENTERPRISE_PLAN_SLUG } from '../../../utils/constants';
import { useSubmitOnboarding } from '../hooks/useSubmitOnboarding';
import { Typography } from '@getpara/react-component-library';

export const PlanSelect = () => {
  const { planMeta } = usePlanMetadata();
  const { data: enterprisePrice } = useGetOrganizationEnterprisePrice();
  const { submitOnboarding, isLoading } = useSubmitOnboarding();

  const handleSubmitClick = async (planSlug: string) => {
    await submitOnboarding(planSlug);
  };

  return (
    <div className="para:flex para:justify-center para:w-full">
      <div className="para:flex para:flex-col para:gap-8 para:justify-center para:min-w-0">
        <Typography className="para:text-3xl para:font-semibold para:text-center">Choose Your Tier</Typography>
        <div className="para:flex para:flex-col para:gap-2 para:justify-center">
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
        </div>
      </div>
    </div>
  );
};
