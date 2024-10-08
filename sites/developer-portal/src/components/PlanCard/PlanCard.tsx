import styled from 'styled-components';
import { SplitCard } from '../../components/SplitCard/SplitCard';
import { PlanCardLeft } from './PlanCardLeft';
import { PlanCardRight } from './PlanCardRight';
import { PlanMetadata } from '../../types/planMetadata';
import { MOBILE_SIZE, MOST_POPULAR_PLAN_SLUG } from '../../utils/constants';

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
  const isOnboardingType = type === 'onboarding';
  const isMostPopular = planMetadata.slug === MOST_POPULAR_PLAN_SLUG;

  return (
    <Container>
      <SplitCard
        highlighted={isOnboardingType && isMostPopular}
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
    </Container>
  );
};

const Container = styled.div`
  @media (min-width: ${MOBILE_SIZE + 1}px) {
    width: 848px;
  }

  max-width: 848px;
`;
