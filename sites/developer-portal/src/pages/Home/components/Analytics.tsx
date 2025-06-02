import { Typography } from '@getpara/react-component-library';
import { OverviewContainer } from '../../../components/Analytics/Overview/OverviewContainer';
import { NewUsersOverviewWrapper } from './NewUsersOverviewWrapper';
import { ChartsContainer } from '../../../components/Analytics/charts/ChartsContainer';
import { MauChartWrapper } from './MauChartWrapper';
import { LoginMethodsChartWrapper } from './LoginMethodsChartWrapper';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';

export const Analytics = () => {
  const { data: capabilities } = useOrganizationMemberCapabilities();

  if (!capabilities?.canViewOrganizationAnalytics) {
    return null;
  }

  return (
    <>
      <div className="para:h-[1px] para:bg-border para:max-w-screen para:w-[100vw] para:md:w-[calc(100%+48px)] para:-ml-8 para:md:-ml-6" />
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
    </>
  );
};
