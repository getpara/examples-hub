import { PlanCardLeft } from './PlanCardLeft';
import { PlanCardRight } from './PlanCardRight';
import { PlanMetadata } from '../../types/planMetadata';
import { FlatCard } from '../FlatCard';

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
    <FlatCard className="para:p-6">
      <div className={'para:flex para:flex-col para:gap-4 para:md:flex-row para:md:gap-6'}>
        <PlanCardLeft
          {...planMetadata}
          isActive={isActive}
          isHigherPlanActive={isHigherPlanActive}
          disabled={disabled}
          enterprisePrice={enterprisePrice}
          type={type}
          onUpgradeClick={onUpgradeClick}
        />
        <PlanCardRight {...planMetadata.includes} />
      </div>
    </FlatCard>
  );
};
