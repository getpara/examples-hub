import styled from 'styled-components';
import { LINEAR_GRADIENT } from '../common';

interface GradientProgressBarProps {
  current: number;
  max: number;
}

export const GradientProgressBar = ({ current, max }: GradientProgressBarProps) => {
  const fillWidth = (current / max) * 100;

  return (
    <Container>
      <GradientBar $width={fillWidth} />
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  height: 4px;
  width: 100%;
  border-radius: 1000px;
  background-color: var(--cpsl-color-background-8);
`;

const GradientBar = styled.div<{ $width: number }>`
  position: absolute;
  height: 100%;
  width: ${({ $width }) => `${Math.min($width, 100)}%`};
  border-radius: 1000px;
  background: ${LINEAR_GRADIENT};
`;
