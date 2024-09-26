import { PlanMetrics } from './PlanMetrics';
import { Plans } from './Plans';
import { FooterCard } from './FooterCard';
import { PaymentMethod } from './PaymentMethod';

export const BillingContent = () => {
  return (
    <>
      <PlanMetrics />
      <PaymentMethod />
      <Plans />
      <FooterCard />
    </>
  );
};
