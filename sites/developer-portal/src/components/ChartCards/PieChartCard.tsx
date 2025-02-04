import { CpslCard, CpslText } from '@getpara/react-components';
import { ResponsiveContainer } from 'recharts';
import styled from 'styled-components';
import { ReactElement } from 'react';

interface PieChartCardProps {
  heading: string;
  Chart: ReactElement;
  legendData?: { label: string; value: number; totalCount: number }[];
}

export const PieChartCard = ({ heading, Chart, legendData }: PieChartCardProps) => {
  return (
    <StyledCard>
      <Container>
        <CpslText variant="headingXS" weight="semiBold">
          {heading}
        </CpslText>
        <ContentContainer>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              {Chart}
            </ResponsiveContainer>
          </ChartContainer>
          {legendData && (
            <LegendContainer>
              {legendData.map((ld, ind) => (
                <LegendItemContainer key={`${ld.label}-${ld.value}`}>
                  <LegendItemNameContainer>
                    <LegendItemLabel $index={ind} />
                    <CpslText weight="medium">{ld.label}</CpslText>
                  </LegendItemNameContainer>
                  <CpslText weight="medium">{ld.totalCount}</CpslText>
                  <CpslText weight="medium">{ld.value < 1 ? '<1' : ld.value > 99 ? '>99' : ld.value}%</CpslText>
                </LegendItemContainer>
              ))}
            </LegendContainer>
          )}
        </ContentContainer>
      </Container>
    </StyledCard>
  );
};

const StyledCard = styled(CpslCard)`
  &::part(card-container) {
    height: 457px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: space-between;
  height: 100%;
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 66px;
  flex-wrap: wrap;
`;

const ChartContainer = styled.div`
  height: 330px;
  width: 330px;
`;

const LegendContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const LegendItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LegendItemNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LegendItemLabel = styled.div<{ $index: number }>`
  height: 16px;
  width: 16px;
  border-radius: 2px;

  background-color: ${({ $index }) => `var(--cpsl-color-foreground-${$index * 8})`};
`;
