import { Typography } from '@getpara/react-component-library';
import { OverviewContainer } from '../../../components/Analytics/Overview/OverviewContainer';
import { NewUsersOverviewWrapper } from './NewUsersOverviewWrapper';
import { ChartsContainer } from '../../../components/Analytics/charts/ChartsContainer';
import { MauChartWrapper } from './MauChartWrapper';
import { LoginMethodsChartWrapper } from './LoginMethodsChartWrapper';

export const Analytics = () => {
  return (
    <div className="para:pt-8 para:flex para:flex-col para:gap-4">
      <Typography className="para:text-2xl para:font-semibold">Analytics</Typography>
      <OverviewContainer>
        <NewUsersOverviewWrapper />
      </OverviewContainer>
      <ChartsContainer>
        <MauChartWrapper />
        <LoginMethodsChartWrapper />
      </ChartsContainer>
    </div>
  );
};
