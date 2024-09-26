import styled from 'styled-components';
import { SplitCard } from '../../../components/SplitCard/SplitCard';
import { PlanCardLeft } from './PlanCardLeft';
import { PlanCardRight } from './PlanCardRight';
import { PlanMetadata } from '../../../types/planMetadata';

interface PlanCardProps {
  planMetadata: PlanMetadata;
  isActive?: boolean;
  isHigherPlanActive?: boolean;
  enterprisePrice?: number;
  disabled?: boolean;
  onUpgradeClick: (planSlug: string) => void;
}

export const PlanCard = ({
  planMetadata,
  isActive,
  isHigherPlanActive,
  enterprisePrice,
  disabled,
  onUpgradeClick,
}: PlanCardProps) => {
  return (
    <Container>
      <SplitCard
        LeftContent={
          <PlanCardLeft
            {...planMetadata}
            isActive={isActive}
            isHigherPlanActive={isHigherPlanActive}
            disabled={disabled}
            enterprisePrice={enterprisePrice}
            onUpgradeClick={onUpgradeClick}
          />
        }
        RightContent={<PlanCardRight {...planMetadata.includes} />}
      />
    </Container>
  );
};

const Container = styled.div`
  max-width: 840px;
`;
