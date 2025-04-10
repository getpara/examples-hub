import { SplitCard } from '../../components/SplitCard/SplitCard';
import { PlanCardLeft } from './PlanCardLeft';
import { PlanCardRight } from './PlanCardRight';
import { PlanMetadata } from '../../types/planMetadata';

export type PlanCardType = 'billing' | 'onboarding';

interface PlanCardProps {
  planMetadata: PlanMetadata;
  isActive?: boolean;
  isHigherPlanActive?: boolean;
  enterprisePrice?: number;
  disabled?: boolean;
  type?: PlanCardType;
  onUpgradeClick: (planSlug: string) => void;
}

export const PlanCard = ({
  planMetadata,
  isActive,
  isHigherPlanActive,
  enterprisePrice,
  disabled,
  type = 'billing',
  onUpgradeClick,
}: PlanCardProps) => {
  return (
    <div className="para:flex para:shrink para:w-[848px] para:min-w-0 para:max-w-full">
      <SplitCard
        LeftContent={
          <PlanCardLeft
            {...planMetadata}
            isActive={isActive}
            isHigherPlanActive={isHigherPlanActive}
            disabled={disabled}
            enterprisePrice={enterprisePrice}
            type={type}
            onUpgradeClick={onUpgradeClick}
          />
        }
        RightContent={<PlanCardRight {...planMetadata.includes} />}
      />
    </div>
  );
};
