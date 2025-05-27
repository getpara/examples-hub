import { BillingCycleOverview } from './BillingCycleOverview';
import { MonthlyActiveOverview } from './MonthlyActiveOverview';
import { PlanOverview } from './PlanOverview';
import { TotalUsersOverview } from './TotalUsersOverview';

export const Overviews = () => {
  return (
    <div className="para:grid para:gap-2 para:sm:grid-cols-[repeat(2,minmax(200px,1fr))] para:grid-cols-[repeat(1,minmax(200px,1fr))]">
      <PlanOverview />
      <MonthlyActiveOverview />
      <TotalUsersOverview />
      <BillingCycleOverview />
    </div>
  );
};
