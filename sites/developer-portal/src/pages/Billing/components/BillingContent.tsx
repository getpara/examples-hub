import { CpslText } from '@usecapsule/react-components';
import { PlanMetrics } from './PlanMetrics';
import { Plans } from './Plans';
import { FooterCard } from './FooterCard';

export const BillingContent = () => {
  return (
    <>
      <PlanMetrics />
      <CpslText variant="bodyL" weight="semiBold">
        Plans
      </CpslText>
      <Plans />
      <FooterCard />
    </>
  );
};
