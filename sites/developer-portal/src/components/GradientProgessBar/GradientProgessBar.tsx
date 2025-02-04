import styled from 'styled-components';
import { LINEAR_GRADIENT } from '../common';
import { para } from '../../clients/para';
import { OnboardingStep, useOnboardingStore } from '../../stores/onboarding/useOnboardingStore';

interface GradientProgressBarProps {
  current: number;
  max: number;
  maxWidth?: number;
}

export const GradientProgressBar = ({ current, max, maxWidth }: GradientProgressBarProps) => {
  const userId = para.getUserId();
  const currentStep = useOnboardingStore(state => state.getStep(userId));

  const fillWidth = (current / max) * 100;

  return (
    <Container $maxWidth={maxWidth} $visible={currentStep !== OnboardingStep.PLAN_SELECT}>
      <GradientBar $width={fillWidth} />
    </Container>
  );
};

const Container = styled.div<{ $maxWidth?: number; $visible?: boolean }>`
  position: relative;
  height: 4px;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth && `${$maxWidth}px`};
  border-radius: 1000px;
  background-color: var(--cpsl-color-background-8);
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
`;

const GradientBar = styled.div<{ $width: number }>`
  position: absolute;
  height: 100%;
  width: ${({ $width }) => `${Math.min($width, 100)}%`};
  border-radius: 1000px;
  background: ${LINEAR_GRADIENT};
  transition: all 0.25s;
`;
