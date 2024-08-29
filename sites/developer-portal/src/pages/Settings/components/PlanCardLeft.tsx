import styled from 'styled-components';
import { Plan } from '../../../types/plan';
import { CpslText } from '@usecapsule/react-components';
import { InlineText } from '../../../components/common';
import { GradientCTAButton } from '../../../components/GradientCTAButton/GradientCTAButton';

interface PlanCardLeftProps
  extends Pick<Plan, 'name' | 'allowanceString' | 'footnote' | 'monthlyCost' | 'mustContact' | 'slug'> {
  isActive?: boolean;
  isHigherPlanActive?: boolean;
  disabled?: boolean;
  onUpgradeClick: (planName: string, planeSlug: string) => void;
}

export const PlanCardLeft = ({
  name,
  allowanceString,
  footnote,
  monthlyCost,
  mustContact,
  isActive,
  isHigherPlanActive,
  slug,
  disabled,
  onUpgradeClick,
}: PlanCardLeftProps) => {
  const handleUpgradePlanClick = () => {
    onUpgradeClick(name, slug);
  };

  return (
    <Container>
      <TopContainer>
        <CpslText variant="bodyL" weight="semiBold">
          {name}
        </CpslText>
        {mustContact ? (
          <CpslText variant="headingS" weight="bold">
            Ask Us!
          </CpslText>
        ) : (
          <>
            <span>
              <InlineText variant="headingS" weight="bold">
                ${monthlyCost}
              </InlineText>
              <InlineText variant="bodyS" color="secondary">
                /mo
              </InlineText>
            </span>
            <CpslText variant="bodyS" color="tertiary">
              {allowanceString}
            </CpslText>
          </>
        )}
        {isHigherPlanActive ? null : isActive ? (
          <CurrentPlanContainer>
            <CpslText variant="body2XS" color="tertiary" weight="medium">
              CURRENT PLAN
            </CpslText>
          </CurrentPlanContainer>
        ) : (
          <GradientCTAButton disabled={disabled} onClick={handleUpgradePlanClick}>
            Upgrade
          </GradientCTAButton>
        )}
      </TopContainer>
      {footnote && (
        <BottomContainer>
          <CpslText variant="body2XS" color="tertiary" weight="medium">
            {footnote}
          </CpslText>
        </BottomContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BottomContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
`;

const CurrentPlanContainer = styled.div`
  width: fit-content;
  padding: 8px 16px;
  border: 1px solid var(--cpsl-color-background-4);
  border-radius: 4px;
`;
