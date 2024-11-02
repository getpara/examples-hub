import React from 'react';
import { AccordionItem, AccordionTrigger } from '../UI';

interface DepositCryptoConfiguratorProps {}

export const DepositCryptoConfigurator: React.FC<DepositCryptoConfiguratorProps> = () => {
  return (
    <AccordionItem value="deposit-crypto" enableToggle>
      <AccordionTrigger
        label="Deposit Crypto"
        secondaryText="Allow users to deposit crypto from another wallet or exchange. This configuration is managed in the Capsule Developer Portal in the On & Off Ramps section."
      />
    </AccordionItem>
  );
};
