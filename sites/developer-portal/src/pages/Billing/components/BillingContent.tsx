import { Plans } from './Plans';
import { PaymentMethod } from './PaymentMethod';
import { Overviews } from './Overviews';
import { ManagePlan } from './ManagePlan';
import { CancelWarning } from './CancelWarning';
import { FooterCard } from './FooterCard';

export const BillingContent = () => {
  return (
    <>
      <CancelWarning />
      <Overviews />
      <PaymentMethod />
      <ManagePlan />
      <Plans />
      <FooterCard />
    </>
  );
};
