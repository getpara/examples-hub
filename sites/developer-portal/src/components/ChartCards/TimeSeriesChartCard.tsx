import { CpslCard, CpslText } from '@getpara/react-components';
import { ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import { ReactElement } from 'react';

interface TimeSeriesChartCardProps {
  heading: string;
  Chart: ReactElement;
}

export const TimeSeriesChartCard = ({ heading, Chart }: TimeSeriesChartCardProps) => {
  return (
    <StyledCard>
      <Container>
        <CpslText variant="headingXS" weight="semiBold">
          {heading}
        </CpslText>
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            {Chart}
          </ResponsiveContainer>
        </ChartContainer>
      </Container>
    </StyledCard>
  );
};

const StyledCard = styled(CpslCard)`
  &::part(card-container) {
    height: 362px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: space-between;
  height: 100%;
`;

const ChartContainer = styled.div`
  height: 250px;
`;
