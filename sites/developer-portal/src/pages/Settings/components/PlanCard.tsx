import styled from 'styled-components';
import { SplitCard } from '../../../components/SplitCard/SplitCard';
import { Plan } from '../../../types/plan';
import { PlanCardLeft } from './PlanCardLeft';
import { PlanCardRight } from './PlanCardRight';

interface PlanCardProps {
  plan: Plan;
  isActive?: boolean;
  isHigherPlanActive?: boolean;
  disabled?: boolean;
  onUpgradeClick: (planName: string, planeSlug: string) => void;
}

export const PlanCard = ({ plan, isActive, isHigherPlanActive, disabled, onUpgradeClick }: PlanCardProps) => {
  return (
    <Container>
      <SplitCard
        LeftContent={
          <PlanCardLeft
            {...plan}
            isActive={isActive}
            isHigherPlanActive={isHigherPlanActive}
            disabled={disabled}
            onUpgradeClick={onUpgradeClick}
          />
        }
        RightContent={<PlanCardRight {...plan.includes} />}
      />
    </Container>
  );
};

const Container = styled.div`
  max-width: 840px;
`;
