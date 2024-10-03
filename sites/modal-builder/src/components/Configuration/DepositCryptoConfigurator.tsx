import React from 'react';
import { AccordionItem, AccordionTrigger } from '../UI';

interface DepositCryptoConfiguratorProps {}

export const DepositCryptoConfigurator: React.FC<DepositCryptoConfiguratorProps> = () => {
  return (
    <AccordionItem value="deposit-crypto" enableToggle>
      <AccordionTrigger label="Deposit Crypto" secondaryText="Allow users to deposit crypto from another source" />
    </AccordionItem>
  );
};
