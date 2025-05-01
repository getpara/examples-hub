import { LoginMethodsChart } from './LoginMethodsChart';
import { MauChart } from './MauChart';

export const Charts = () => {
  return (
    <div className="para:flex para:gap-2 para:flex-col para:xl:flex-row">
      <MauChart />
      <LoginMethodsChart />
    </div>
  );
};
