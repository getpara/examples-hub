import React from 'react';
import { AccordionItem, AccordionTrigger } from '../UI';

const SECTION_LABEL = 'Deposit Crypto';
const SECTION_SECONDARY_TEXT =
  'Allow users to deposit crypto from another wallet or exchange. This configuration is managed in the Para Developer Portal in the On & Off Ramps section.';

interface DepositCryptoConfiguratorProps {}

export const DepositCryptoConfigurator: React.FC<DepositCryptoConfiguratorProps> = () => {
  return (
    <AccordionItem value="deposit-crypto" enableToggle>
      <AccordionTrigger label={SECTION_LABEL} secondaryText={SECTION_SECONDARY_TEXT} />
    </AccordionItem>
  );
};
