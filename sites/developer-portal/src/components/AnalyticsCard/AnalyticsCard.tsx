import styled from 'styled-components';
import { CpslText } from '@usecapsule/react-components';
import { BaseCard } from '../common';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useRef } from 'react';

interface AnalyticsCardProps {
  title: string;
  subtitle: string;
  subtitleColor?: 'tertiary' | 'error';
  warning?: string;
  useMaxWidth?: boolean;
}

export const AnalyticsCard = ({ title, subtitle, subtitleColor = 'tertiary', warning, useMaxWidth }: AnalyticsCardProps) => {
  const textRef = useRef<HTMLCpslTextElement>(null);

  const getTextWidth = (text: string) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = 'bold 32px Inter';
      const metrics = context.measureText(text);
      return metrics.width;
    }
    return undefined;
  };

  const isMobile = useIsMobile();

  return (
    <Container>
      <AnalyticContainer>
        <InnerContainer $maxWidth={useMaxWidth ? getTextWidth(title) : undefined}>
          <CenterText ref={textRef} variant={isMobile ? 'headingXS' : 'headingS'} weight="bold">
            {title}
          </CenterText>
          <CenterText variant="bodyS" color={subtitleColor}>
            {subtitle}
          </CenterText>
          <WarningText variant="bodyXS" weight="medium">
            {warning}
          </WarningText>
        </InnerContainer>
      </AnalyticContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AnalyticContainer = styled(BaseCard)`
  flex: 1;
  height: 100%;
  display: flex;
`;

const InnerContainer = styled.div<{ $maxWidth?: number }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  align-items: center;
  gap: 8px;
  ${({ $maxWidth }) => $maxWidth && `max-width: ${$maxWidth}px`};
`;

const CenterText = styled(CpslText)`
  text-align: center;
`;

const WarningText = styled(CenterText)`
  --color-override: var(--cpsl-color-utility-yellow);
`;
