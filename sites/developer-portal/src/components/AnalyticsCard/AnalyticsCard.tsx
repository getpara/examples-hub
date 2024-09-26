import styled from 'styled-components';
import { CpslText } from '@usecapsule/react-components';
import { BaseCard } from '../common';
import { useIsMobile } from '../../hooks/useIsMobile';

interface AnalyticsCardProps {
  title: string;
  subtitle: string;
  subtitleColor?: 'tertiary' | 'error';
}

export const AnalyticsCard = ({ title, subtitle, subtitleColor = 'tertiary' }: AnalyticsCardProps) => {
  const isMobile = useIsMobile();

  return (
    <AnalyticContainer>
      <CenterText variant={isMobile ? 'headingXS' : 'headingS'} weight="bold">
        {title}
      </CenterText>
      <CenterText variant="bodyS" color={subtitleColor}>
        {subtitle}
      </CenterText>
    </AnalyticContainer>
  );
};

const AnalyticContainer = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const CenterText = styled(CpslText)`
  text-align: center;
`;
