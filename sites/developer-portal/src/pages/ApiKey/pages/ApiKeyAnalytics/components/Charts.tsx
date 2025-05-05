import { ChartsContainer } from '../../../../../components/Analytics/charts/ChartsContainer';
import { LoginMethodsChartWrapper } from './LoginMethodsChartWrapper';
import { MauChartWrapper } from './MauChartWrapper';

export const Charts = () => {
  return (
    <ChartsContainer>
      <MauChartWrapper />
      <LoginMethodsChartWrapper />
    </ChartsContainer>
  );
};
