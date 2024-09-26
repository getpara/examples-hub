import { MonthlyActiveUsersTSChart } from './MonthlyActiveUsersTSChart';
import { TotalUsersTSChart } from './TotalUsersTSChart';

export const AnalyticsTab = () => {
  return (
    <>
      <TotalUsersTSChart />
      <MonthlyActiveUsersTSChart />
    </>
  );
};
